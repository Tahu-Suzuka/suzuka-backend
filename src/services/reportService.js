import htmlPdf from 'html-pdf-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import { Order } from '../models/orderModel.js';
import { OrderItem } from '../models/orderItemModel.js';
import { ProductVariation } from '../models/productVariationModel.js';
import { Product } from '../models/productModel.js';
import { User } from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportService {
  async _getProductSalesData(queryParams) {
    let { startDate, endDate, period } = queryParams;

    if (period) {
      const now = new Date();
      let start = new Date();
      let end = new Date();

      switch (period) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'week':
          const dayOfWeek = now.getDay();
          start.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
      }
      startDate = start;
      endDate = end;
    } else {
      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const orderItems = await OrderItem.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            orderStatus: { [Op.in]: ['Diproses', 'Dikirim', 'Selesai'] },
            orderDate: { [Op.between]: [startDate, endDate] },
          },
          attributes: [],
        },
        {
          model: ProductVariation,
          as: 'variation',
          include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
        },
      ],
    });

    const salesSummary = new Map();
    let totalOverallRevenue = 0;
    for (const item of orderItems) {
      const key = item.variation.id;
      const revenue = item.price * item.quantity;
      totalOverallRevenue += revenue;
      if (salesSummary.has(key)) {
        const current = salesSummary.get(key);
        current.totalQuantitySold += item.quantity;
        current.totalRevenue += revenue;
      } else {
        salesSummary.set(key, {
          productName: item.variation.product.product_name,
          variationName: item.variation.name,
          totalQuantitySold: item.quantity,
          totalRevenue: revenue,
        });
      }
    }

    const salesData = Array.from(salesSummary.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((sale, index) => {
        sale.no = index + 1; // Tambahkan nomor urut
        sale.formattedTotalRevenue = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(sale.totalRevenue);
        return sale;
      });

    return {
      startDate: startDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      endDate: endDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      sales: salesData,
      totalOverallRevenue: totalOverallRevenue.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }),
    };
  }

    async _getProcessingOrdersData() {
        const orders = await Order.findAll({
            where: { orderStatus: 'Diproses' },
            include: [
                { model: User, as: 'user', attributes: ['name'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: ProductVariation,
                        as: 'variation',
                        attributes: ['name'],
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['product_name']
                        }]
                    }]
                }
            ],
            order: [['orderDate', 'ASC']]
        });

        // Logika untuk merangkum total produk yang harus disiapkan
        const productSummary = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const key = `${item.variation.product.product_name} (${item.variation.name})`;
                productSummary[key] = (productSummary[key] || 0) + item.quantity;
            });
        });

        // Menambahkan nomor urut ke data sebelum dikirim
        const numberedOrders = orders.map((order, index) => ({
            no: index + 1,
            ...order.toJSON()
        }));

        const numberedProductSummary = Object.entries(productSummary)
            .map(([key, value], index) => ({ no: index + 1, name: key, quantity: value }));

        return {
            generatedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
            orders: numberedOrders,
            productSummary: numberedProductSummary
        };
    }

  async getProductSalesReport(queryParams) {
    const { page = 1, limit = 8, ...otherParams } = queryParams;
    
    // Get all data first (existing logic)
    const reportData = await this._getProductSalesData(otherParams);
    
    // Apply pagination to sales data
    const offset = (page - 1) * limit;
    const totalItems = reportData.sales.length;
    const paginatedSales = reportData.sales.slice(offset, offset + parseInt(limit));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      ...reportData,
      sales: paginatedSales,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    };
  }

async createProductSalesReportPDF(queryParams) {
    const reportData = await this._getProductSalesData(queryParams);
    let htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/product-sales-template.html'), 'utf-8');
    
    // Simple string replacements
    let html = htmlTemplate;
    
    // Replace basic report data
    html = html.replace(/\{\{report\.startDate\}\}/g, reportData.startDate || '');
    html = html.replace(/\{\{report\.endDate\}\}/g, reportData.endDate || '');
    html = html.replace(/\{\{report\.totalOverallRevenue\}\}/g, reportData.totalOverallRevenue || '');
    
    // Build table rows for sales data sesuai dengan template HTML
    let salesTableRows = '';
    if (reportData.sales && Array.isArray(reportData.sales)) {
        reportData.sales.forEach(sale => {
            salesTableRows += `
        <tr class="item">
            <td>${sale.no || ''}</td>
            <td>${sale.productName || ''}</td>
            <td>${sale.variationName || ''}</td>
            <td class="text-right">${sale.totalQuantitySold || ''} Bungkus</td>
            <td class="text-right">${sale.formattedTotalRevenue || ''}</td>
        </tr>`;
        });
    }
    
    const eachPattern = /\{\{#each report\.sales\}\}[\s\S]*?\{\{\/each\}\}/g;
    html = html.replace(eachPattern, salesTableRows);
    
    const options = { 
        format: 'A4',
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        printBackground: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    const filename = `./laporan-penjualan-${Date.now()}.pdf`;
    fs.writeFileSync(filename, pdfBuffer);
    
    return filename;
}
    
    async getProcessingReport() {
        return await this._getProcessingOrdersData();
    }

async createProcessingReportPDF() {
    const reportData = await this._getProcessingOrdersData();
    let htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/processing-report-template.html'), 'utf-8');
    
    // Replace basic report data first
    let html = htmlTemplate;
    html = html.replace(/\{\{report\.generatedDate\}\}/g, reportData.generatedDate || '');
    
    let ordersTableRows = '';
    if (reportData.orders && Array.isArray(reportData.orders)) {
        reportData.orders.forEach(order => {
            // Build items and quantities lists
            let itemsList = '';
            let quantitiesList = '';
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productName = item.variation?.product?.product_name || '';
                    const variationName = item.variation?.name || '';
                    itemsList += `<li>${productName} (${variationName})</li>`;
                    quantitiesList += `<li>${item.quantity || 0} Bungkus</li>`;
                });
            }
            
            ordersTableRows += `
        <tr class="item">
            <td>${order.no || ''}</td>
            <td>${order.user?.name || ''}</td>
            <td>
                <ul style="margin: 0; padding-left: 20px;">
                ${itemsList}
                </ul>
            </td>
            <td class="text-right">
                <ul style="margin: 0; padding-left: 0; list-style: none;">
                ${quantitiesList}
                </ul>
            </td>
        </tr>`;
        });
    }
    
    let summaryTableRows = '';
    if (reportData.productSummary && Array.isArray(reportData.productSummary)) {
        reportData.productSummary.forEach(item => {
            summaryTableRows += `
        <tr class="item">
            <td>${item.no || ''}</td>
            <td>${item.name || ''}</td>
            <td class="text-right">${item.quantity || ''} Bungkus</td>
        </tr>`;
        });
    }
    
    const ordersBlockStart = html.indexOf('{{#each report.orders}}');
    if (ordersBlockStart !== -1) {
        // Find the matching closing {{/each}} for the orders block
        // We need to count opening and closing {{#each}} and {{/each}} to find the right one
        let pos = ordersBlockStart + '{{#each report.orders}}'.length;
        let eachCount = 1; // We already found one opening {{#each}}
        let ordersBlockEnd = -1;
        
        while (pos < html.length && eachCount > 0) {
            const nextEachOpen = html.indexOf('{{#each', pos);
            const nextEachClose = html.indexOf('{{/each}}', pos);
            
            if (nextEachClose === -1) break; 
            
            if (nextEachOpen !== -1 && nextEachOpen < nextEachClose) {
                eachCount++;
                pos = nextEachOpen + '{{#each'.length;
            } else {
                eachCount--;
                if (eachCount === 0) {
                    ordersBlockEnd = nextEachClose + '{{/each}}'.length;
                    break;
                }
                pos = nextEachClose + '{{/each}}'.length;
            }
        }
        
        if (ordersBlockEnd !== -1) {
            const beforeOrders = html.substring(0, ordersBlockStart);
            const afterOrders = html.substring(ordersBlockEnd);
            html = beforeOrders + ordersTableRows + afterOrders;
        }
    }
    
    const summaryPattern = /\{\{#each report\.productSummary\}\}[\s\S]*?\{\{\/each\}\}/g;
    html = html.replace(summaryPattern, summaryTableRows);
    
    const options = { 
        format: 'A4',
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        printBackground: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    const filename = `./laporan-operasional-${Date.now()}.pdf`;
    fs.writeFileSync(filename, pdfBuffer);
    
    return filename;
  }
}

export { ReportService };
