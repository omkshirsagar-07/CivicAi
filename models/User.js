import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    lastLoginAt: { type: Date, default: null },
    role: {
      type: String,
      enum: ['CITIZEN', 'MAIN_ADMIN', 'DEPARTMENT_ADMIN'],
      default: 'CITIZEN',
      index: true,
    },
    department: { type: String, trim: true, maxlength: 160, default: null },
  },
  { timestamps: true }
);

// Avoid model re-registration during dev hot reload.
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
