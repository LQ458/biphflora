const mongoose = require("mongoose");

const auditEventSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, immutable: true },
    method: { type: String, required: true, immutable: true },
    route: { type: String, required: true, immutable: true },
    status: { type: Number, required: true, immutable: true },
    requestId: { type: String, required: true, immutable: true },
    actorSignature: { type: String, immutable: true },
    occurredAt: { type: Date, required: true, immutable: true },
  },
  {
    collection: "audit_events",
    versionKey: false,
  },
);

module.exports = mongoose.model("AuditEvent", auditEventSchema);
