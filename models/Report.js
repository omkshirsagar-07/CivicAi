import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Report — the core CivicAI document.
 *
 * Stores the citizen complaint, the *validated* AI analysis, GridFS evidence
 * reference, cross-validation result, emergency assessment, deterministic
 * priority and the confirmed location. Public map projections are handled at
 * query time so no private fields are ever selected on the wire.
 */
const reportSchema = new Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true },

    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    complaint: { type: String, required: true, trim: true, maxlength: 4000 },

    // Validated AI classification
    issue: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    department: { type: String, required: true, trim: true, maxlength: 160 },
    summary: { type: String, trim: true, maxlength: 500 },

    // Priority (deterministic) + AI-supported severity
    priority: {
      type: String,
      enum: ['Emergency', 'High', 'Medium', 'Low'],
      required: true,
      index: true,
    },
    priorityScore: { type: Number, min: 0, max: 100, required: true, index: true },
    severity: { type: Number, min: 1, max: 10, required: true },
    complaintConfidence: { type: Number, min: 0, max: 1, required: true },
    reason: { type: String, trim: true, maxlength: 800 },

    // GridFS evidence reference (never the binary itself)
    imageFileId: { type: String, default: null },
    imageMimeType: { type: String, default: null },

    // Stored analysis objects (already schema-validated on ingest)
    imageAnalysis: { type: Schema.Types.Mixed, default: null },

    verification: { type: Schema.Types.Mixed, default: null },

    emergency: { type: Schema.Types.Mixed, default: null },

    duplicateDetection: { type: Schema.Types.Mixed, default: null },

    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
    resolutionNote: { type: String, trim: true, maxlength: 2000, default: null },
    resolutionProofFileId: { type: String, default: null },
    resolutionProofMimeType: { type: String, default: null },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },

    location: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      address: { type: String, trim: true, maxlength: 500, default: '' },
      city: { type: String, trim: true, maxlength: 120, default: '' },
      accuracy: { type: Number, default: null },
    },

    // Non-geo coordinates used for nearby searches via the legacy driver
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { timestamps: true }
);

reportSchema.index({ 'geo': '2dsphere' });

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export default Report;
