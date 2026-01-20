const mongoose = require('mongoose');

const RegistroPontoSchema = new mongoose.Schema({
    promotor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotor',
        required: true
    },
    tipo: {
        type: String,
        enum: ['ENTRADA', 'SAIDA'],
        required: true
    },
    dataHora: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RegistroPonto', RegistroPontoSchema);
