import PDFDocument from 'pdfkit';
import Certificate from '../models/Certificate.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';

const verifyUrl = (id) => `${env.CLIENT_URL.replace(/\/$/, '')}/certificates/verify/${id}`;

export const myCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ student: req.user._id }).sort('-issuedAt').populate('course', 'slug thumbnail').lean();
  return ok(res, certs.map((c) => ({ ...c, verificationUrl: verifyUrl(c.certificateId) })));
});

// Public: reveals only what is printed on the certificate.
export const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId.toUpperCase() }).lean();
  if (!cert) return ok(res, { valid: false });
  return ok(res, { valid: true, certificateId: cert.certificateId, studentName: cert.studentName, courseTitle: cert.courseTitle, instructorName: cert.instructorName, issuedAt: cert.issuedAt });
});

export const certificatePdf = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId.toUpperCase() }).lean();
  if (!cert) throw new AppError('Certificate not found.', 404);
  if (String(cert.student) !== String(req.user._id) && req.user.role !== 'admin') throw new AppError('You can only download your own certificates.', 403);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateId}.pdf"`);
  doc.pipe(res);

  const W = doc.page.width;
  const H = doc.page.height;
  doc.rect(0, 0, W, H).fill('#f6f4ff');
  doc.lineWidth(3).rect(28, 28, W - 56, H - 56).stroke('#5a4bd8');
  doc.lineWidth(1).rect(40, 40, W - 80, H - 80).stroke('#b7b9c9');

  const centre = (text, y, size, font, color) => doc.font(font).fontSize(size).fillColor(color).text(text, 70, y, { width: W - 140, align: 'center' });
  centre('LEARNSPHERE', 78, 14, 'Helvetica-Bold', '#5a4bd8');
  centre('Certificate of Completion', 108, 38, 'Helvetica-Bold', '#1a1a2e');
  centre('This certifies that', 178, 14, 'Helvetica', '#6a6b80');
  centre(cert.studentName, 205, 34, 'Helvetica-Bold', '#1a1a2e');
  centre('has successfully completed the course', 262, 14, 'Helvetica', '#6a6b80');
  centre(cert.courseTitle, 288, 24, 'Helvetica-Bold', '#5a4bd8');
  centre(`Instructor: ${cert.instructorName}`, 345, 13, 'Helvetica', '#3d3d56');
  centre(`Issued on ${new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 368, 13, 'Helvetica', '#3d3d56');
  centre(`Certificate ID: ${cert.certificateId}`, 430, 11, 'Helvetica-Bold', '#1a1a2e');
  centre(`Verify at ${verifyUrl(cert.certificateId)}`, 448, 10, 'Helvetica', '#6a6b80');
  doc.end();
});
