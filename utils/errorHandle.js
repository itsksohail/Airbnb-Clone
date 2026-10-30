class ErrorHandle extends Error{
    constructor(statuscode, default_message){
        super(default_message);
        this.statuscode = statuscode;
        this.default_message = default_message;
    }
}

module.exports = ErrorHandle;