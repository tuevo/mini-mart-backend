const mongoose = require('mongoose');
const { Schema } = mongoose;

const workAssigmentSchema = new Schema(
  {
    workShift: {
      type: Schema.Types.ObjectId,
      ref: 'WorkShiftModel',
      required: true
    },
    assigner: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true
    },
    description: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const WorkAssignmentModel = mongoose.model('WorkAssignmentModel', workAssigmentSchema, 'WorkAssignments');
module.exports = WorkAssignmentModel;