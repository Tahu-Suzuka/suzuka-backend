import pdf from 'pdf-creator-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Order } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { Op } from 'sequelize';
import { OrderItem } from '../models/orderItemModel.js';
import { Product } from '../models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}



class ReportService {
    async createOrderReportPDF(startDate, endDate) {
        const orders = await Order.findAll({
            where: {
                orderStatus: { [Op.not]: 'Dibatalkan' },
                orderDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                { model: User, as: 'user', attributes: ['name'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['product_name'] }]
                }
            ],
            order: [['orderDate', 'ASC']]
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPayment, 0);
        const totalOrders = orders.length;

        const reportData = {
            startDate: formatDateToDDMMYYYY(startDate),
            endDate: formatDateToDDMMYYYY(endDate),
            totalRevenue: totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            totalOrders: totalOrders,
            orders: orders.map(order => ({
                ...order.toJSON(),
                orderDate: formatDateToDDMMYYYY(order.orderDate), 
                totalPayment: order.totalPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
            }))
        };
        
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/report-template.html'), 'utf-8');

        const options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm"
        };

        const document = {
            html: htmlTemplate,
            data: { report: reportData },
            path: `./laporan-pesanan-${Date.now()}.pdf`
        };

        try {
            const res = await pdf.create(document, options);
            return res.filename;
        } catch (error) {
            console.error(error);
            throw new Error("Gagal membuat file PDF.");
        }
    }
}

export { ReportService };