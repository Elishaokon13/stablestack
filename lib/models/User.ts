import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  clerkId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  blockradarWalletId?: string;
  isOnboardingComplete: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends Model<IUser> {
  findByWalletAddress(walletAddress: string): Promise<IUser | null>;
  findOrCreate(walletAddress: string, email?: string): Promise<IUser>;
  updateOnboardingStatus(walletAddress: string, status: boolean): Promise<IUser | null>;
  updateProfile(walletAddress: string, updates: Partial<IUser>): Promise<IUser | null>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    // Legacy field for backward compatibility - removed unique constraint to avoid conflicts
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to not violate unique constraint
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    blockradarWalletId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Pre-save hook to handle legacy address field
UserSchema.pre('save', function(next) {
  if (this.isModified('walletAddress') && !this.address) {
    this.address = this.walletAddress;
  }
  next();
});

UserSchema.statics.findByWalletAddress = async function (walletAddress: string) {
  return this.findOne({ walletAddress });
};

UserSchema.statics.findOrCreate = async function (walletAddress: string, email?: string) {
  let user = await this.findByWalletAddress(walletAddress);
  if (!user) {
    user = await this.create({ walletAddress, email });
  } else if (email && !user.email) {
    // Update email if it's provided and not already set
    user.email = email;
    await user.save();
  }
  return user;
};

UserSchema.statics.updateOnboardingStatus = async function (walletAddress: string, status: boolean) {
  return this.findOneAndUpdate(
    { walletAddress },
    { $set: { isOnboardingComplete: status } },
    { new: true }
  );
};

UserSchema.statics.updateProfile = async function (walletAddress: string, updates: Partial<IUser>) {
  return this.findOneAndUpdate(
    { walletAddress },
    { $set: updates },
    { new: true }
  );
};

export const User = (mongoose.models.User || mongoose.model<IUser, UserModel>('User', UserSchema)) as UserModel;