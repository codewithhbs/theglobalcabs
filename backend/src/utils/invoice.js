const PDFDocument = require('pdfkit');

// Streams a PDF invoice for a booking to the response.
const generateInvoice = (booking, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking.bookingId}.pdf`);
  doc.pipe(res);

  const navy = '#0f172a';
  const amber = '#f59e0b';

  doc.rect(0, 0, doc.page.width, 110).fill(navy);
  doc.fill(amber).fontSize(22).font('Helvetica-Bold').text(process.env.COMPANY_NAME || 'The Global Cabs', 50, 38);
  doc.fill('#cbd5e1').fontSize(10).font('Helvetica')
    .text(`${process.env.COMPANY_ADDRESS || ''}  |  ${process.env.COMPANY_PHONE || ''}  |  ${process.env.COMPANY_EMAIL || ''}`, 50, 70);

  doc.fill('#111827').fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 50, 140);
  doc.fontSize(10).font('Helvetica').fill('#374151');
  doc.text(`Invoice No: INV-${booking.bookingId}`, 50, 168);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 184);
  doc.text(`Booking ID: ${booking.bookingId}`, 50, 200);
  doc.text(`Status: ${booking.status.toUpperCase()}`, 50, 216);

  doc.font('Helvetica-Bold').text('Billed To', 350, 168);
  doc.font('Helvetica')
    .text(booking.customer?.name || booking.guestDetails?.name || 'Guest', 350, 184)
    .text(booking.customer?.email || booking.guestDetails?.email || '', 350, 200)
    .text(booking.customer?.phone || booking.guestDetails?.phone || '', 350, 216);

  let y = 260;
  doc.rect(50, y, 495, 24).fill('#f1f5f9');
  doc.fill('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('Description', 60, y + 7).text('Amount (₹)', 460, y + 7);
  y += 24;

  doc.font('Helvetica').fill('#374151');
  doc.text(`${booking.tripType} | ${booking.pickupLocation} → ${booking.dropLocation}`, 60, y + 8, { width: 380 });
  y += 30;

  (booking.fare?.breakdown || []).forEach((line) => {
    doc.text(line.label, 60, y).text(String(line.amount), 460, y);
    y += 18;
  });

  doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor('#e5e7eb').stroke();
  doc.font('Helvetica-Bold').fontSize(12).fill('#0f172a')
    .text('Grand Total', 60, y + 14).text(`₹${booking.fare?.total ?? 0}`, 460, y + 14);

  doc.fontSize(9).font('Helvetica').fill('#64748b')
    .text('This is a computer generated invoice and does not require a signature.', 50, 760, { align: 'center', width: 495 });

  doc.end();
};

module.exports = generateInvoice;
