import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: mongoose.Types.ObjectId;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    image: { type: String, trim: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
