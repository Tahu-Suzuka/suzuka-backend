import pdf from 'pdf-creator-node';
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
        return await this._getProductSalesData(queryParams);
    }

    async createProductSalesReportPDF(queryParams) {
        const reportData = await this._getProductSalesData(queryParams);
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/product-sales-template.html'), 'utf-8');
        const document = {
            html: htmlTemplate, data: { report: reportData },
            path: `./laporan-penjualan-${Date.now()}.pdf`
        };
        const res = await pdf.create(document, { format: "A4", orientation: "portrait", border: "10mm" });
        return res.filename;
    }
    
    async getProcessingReport() {
        return await this._getProcessingOrdersData();
    }

    async createProcessingReportPDF() {
        const reportData = await this._getProcessingOrdersData();
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/processing-report-template.html'), 'utf-8');
        const document = {
            html: htmlTemplate,
            data: { report: reportData },
            path: `./laporan-operasional-${Date.now()}.pdf`
        };
        const options = { format: "A4", orientation: "portrait", border: "10mm" };

        const res = await pdf.create(document, options);
        return res.filename;
    }
}

export { ReportService };
