import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface IChat extends Document {
  title: string;
  messages: IMessage[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    title: { type: String, default: 'New Chat' },
    messages: [MessageSchema],
    userId: { type: String, index: true },
  },
  { timestamps: true }
);

ChatSchema.index({ updatedAt: -1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
