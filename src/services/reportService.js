import pdf from 'pdf-creator-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Order } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportService {
    async createOrderReportPDF(startDate, endDate) {
        const orders = await Order.findAll({
            where: {
                orderStatus: { [Op.not]: 'Dibatalkan' }, // Abaikan pesanan yang dibatalkan
                orderDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name']
            }],
            order: [['orderDate', 'ASC']]
        });

        // 2. Hitung data ringkasan
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPayment, 0);
        const totalOrders = orders.length;

        // 3. Siapkan data untuk template
        const reportData = {
            startDate: new Date(startDate).toLocaleDateString('id-ID'),
            endDate: new Date(endDate).toLocaleDateString('id-ID'),
            totalRevenue: totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            totalOrders: totalOrders,
            orders: orders.map(order => ({
                ...order.toJSON(),
                orderDate: new Date(order.orderDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                totalPayment: order.totalPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
            }))
        };
        
        // 4. Baca template HTML
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/report-template.html'), 'utf-8');

        // 5. Konfigurasi PDF
        const options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm"
        };

        const document = {
            html: htmlTemplate,
            data: { report: reportData },
            path: `./laporan-pesanan-${Date.now()}.pdf` // Path output PDF
        };

        // 6. Generate PDF dan kembalikan path filenya
        try {
            const res = await pdf.create(document, options);
            return res.filename; // Mengembalikan path file PDF yang telah dibuat
        } catch (error) {
            console.error(error);
            throw new Error("Gagal membuat file PDF.");
        }
    }
}

export { ReportService };