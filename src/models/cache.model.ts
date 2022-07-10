import { ICache } from "@interfaces/cache.interface";
import { model, Schema } from "mongoose";

const cacheSchema = new Schema<ICache & { _id: string }>(
  {
    _id: { type: String, required: true },
    data: { type: String, required: true },
    ttl: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    _id: false,
  }
);

cacheSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

export const Cache = model<ICache>("Cache", cacheSchema);
