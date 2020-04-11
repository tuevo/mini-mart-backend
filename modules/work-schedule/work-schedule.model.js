const mongoose = require('mongoose');
const { Schema } = mongoose;

const workScheduleSchema = new Schema(
  {
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    workShifts: [{ type: Schema.Types.ObjectId, ref: 'WorkShiftModel' }]
  },
  { timestamps: true }
);

const WorkScheduleModel = mongoose.model('WorkScheduleModel', workScheduleSchema, 'WorkSchedules');
module.exports = WorkScheduleModel;