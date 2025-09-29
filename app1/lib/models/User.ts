import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;
  email?: string;
  name?: string;
  username?: string;
  isOnboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  isOnboardingComplete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Static methods
UserSchema.statics.create = async function(userData: {
  address: string;
  email?: string;
  name?: string;
  username?: string;
}) {
  const user = new this(userData);
  return await user.save();
};

UserSchema.statics.findByAddress = async function(address: string) {
  return await this.findOne({ address: address.toLowerCase() });
};

UserSchema.statics.findByEmail = async function(email: string) {
  return await this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByUsername = async function(username: string) {
  return await this.findOne({ username: username.toLowerCase() });
};

UserSchema.statics.findOrCreate = async function(userData: {
  address: string;
  email?: string;
  name?: string;
}) {
  let user = await this.findByAddress(userData.address);
  
  if (!user) {
    user = await this.create(userData);
  }
  
  return user;
};

UserSchema.statics.updateOnboarding = async function(address: string, data: {
  name?: string;
  email?: string;
  username?: string;
  isOnboardingComplete?: boolean;
}) {
  return await this.findOneAndUpdate(
    { address: address.toLowerCase() },
    { ...data, updatedAt: new Date() },
    { new: true }
  );
};

UserSchema.statics.isUsernameAvailable = async function(username: string) {
  const user = await this.findByUsername(username);
  return !user;
};

UserSchema.statics.generateUniqueUsername = async function(baseName: string) {
  let username = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let counter = 1;
  let finalUsername = username;
  
  while (!(await this.isUsernameAvailable(finalUsername))) {
    finalUsername = `${username}${counter}`;
    counter++;
  }
  
  return finalUsername;
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
