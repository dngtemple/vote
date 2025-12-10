import mongoose, { Schema, Document } from 'mongoose';

export interface IVoter extends Document {
    fullname: string;
    accessCode: string;
    hasVoted: boolean;
}

const VoterSchema: Schema = new Schema({
    fullname: { type: String, required: true },
    accessCode: { type: String, required: true, unique: true },
    hasVoted: { type: Boolean, default: false },
});

export default mongoose.model<IVoter>('Voter', VoterSchema);
