import { Schema, model, Document } from 'mongoose';

export interface CourseDocument extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  category: 'onlinekurs' | 'online-live' | 'schulungszentrum';
  location?: string;
  maxParticipants: number;
  participantCount: number;
  status: 'geplant' | 'aktiv' | 'beendet' | 'abgesagt';
  type: 'live' | 'recorded';
  youtubeUrl?: string;
  thumbnailUrl?: string;
  topics: string[];
  participants: string[];
  createdBy: string;
}

const courseSchema = new Schema<CourseDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    validate: {
      validator: (v: string) => !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Startzeit muss im Format HH:mm sein'
    }
  },
  endTime: {
    type: String,
    validate: {
      validator: (v: string) => !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Endzeit muss im Format HH:mm sein'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['onlinekurs', 'online-live', 'schulungszentrum']
  },
  location: {
    type: String,
    required: function(this: CourseDocument) {
      return this.category === 'schulungszentrum';
    }
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  participantCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['geplant', 'aktiv', 'beendet', 'abgesagt'],
    default: 'geplant'
  },
  type: {
    type: String,
    enum: ['live', 'recorded'],
    required: true
  },
  youtubeUrl: {
    type: String,
    validate: {
      validator: (v: string) => !v || v.includes('youtube.com/') || v.includes('youtu.be/'),
      message: 'URL muss von YouTube sein (youtube.com oder youtu.be)'
    }
  },
  thumbnailUrl: String,
  topics: [{
    type: String
  }],
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Update status based on dates
courseSchema.pre('save', function(this: CourseDocument) {
  const now = new Date();
  const startDate = this.startDate;
  const endDate = this.endDate;

  if (this.status !== 'abgesagt') {
    if (endDate < now) {
      this.status = 'beendet';
    } else if (startDate > now) {
      this.status = 'geplant';
    } else {
      this.status = 'aktiv';
    }
  }
});

// Set type based on category
courseSchema.pre('save', function(this: CourseDocument) {
  this.type = this.category === 'onlinekurs' ? 'recorded' : 'live';
});

export const Course = model<CourseDocument>('Course', courseSchema);
