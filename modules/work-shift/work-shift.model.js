const mongoose = require('mongoose');
const { Schema } = mongoose;

const workShiftSchema = new Schema(
  {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    workSchedule: {
      type: Schema.Types.ObjectId,
      ref: 'WorkScheduleModel'
    },
    workAssignments: [{ type: Schema.Types.ObjectId, ref: 'WorkAssignmentModel' }]
  },
  { timestamps: true }
);

const WorkShiftModel = mongoose.model('WorkShiftModel', workShiftSchema, 'WorkShifts');
module.exports = WorkShiftModel;