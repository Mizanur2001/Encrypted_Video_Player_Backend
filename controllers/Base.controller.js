const fs = require("fs");
const bcrypt = require("bcrypt");

const IsExists = async ({ model, where = null, select = null }) => {
    try {
        let query = model.find(where);
        if (select) query.select(select);
        let doc = await query.lean().exec();
        if (doc.length > 0) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const IsExistsOne = async ({ model, where = null, select = null }) => {
    try {
        let query = model.findOne(where);
        if (select) query.select(select);
        let doc = await query.lean().exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const Count = async ({ model, where = null }) => {
    try {
        let query = model.count(where);
        let doc = await query.lean().exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const Insert = async ({ model, data }) => {
    try {
        let inserted = await new model(data).save();
        return inserted;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const Find = async ({
    model,
    where,
    projection = {},
    select = null,
    sort = null,
    limit = null,
    skip = null,
    populate = null,
    populateField = null,
}) => {
    try {
        let query = model.find(where, projection);
        if (select) query.select(select);
        if (sort) query.sort(sort);
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
        if (populate && populateField) query.populate(populate, populateField);
        else if (populate) query.populate(populate);
        let doc = await query.lean().exec();
        return doc;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const FindOne = async ({
    model,
    where = null,
    select = null,
    populate = null,
    populateField = null,
    sort = null,
}) => {
    try {
        let query = model.findOne(where);
        if (select) query.select(select);
        if (populate && populateField) query.populate(populate, populateField);
        else if (populate) query.populate(populate);
        if (sort) query.sort(sort);
        let doc = await query.lean().exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        return false;
    }
};



const FindAndUpdate = async ({
    model,
    where = {},
    update = {},
    populate = null,
    populateField = null,
}) => {
    try {
        let query = model.findOneAndUpdate(where, update, { new: true });
        if (populate && populateField) query.populate(populate, populateField);
        else if (populate) query.populate(populate);
        let doc = await query.exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const UpdateOne = async ({
    model,
    where,
    update,
    populate = null,
    populateField = null,
}) => {
    try {
        let query = model.updateOne(where, update, { new: true });
        if (populate && populateField) query.populate(populate, populateField);
        else if (populate) query.populate(populate);
        let doc = await query.exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const UpdateMany = async ({ model, where, update }) => {
    try {
        let query = model.updateMany(where, update);
        let doc = await query.exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const Aggregate = async ({ model, data }) => {
    try {
        let query = model.aggregate(data);
        let doc = await query.exec();
        if (doc) return doc;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const Delete = async ({ model, where }) => {
    try {
        let query = model.deleteMany(where);
        let doc = await query.exec();
        if (doc) return true;
        else return false;
    } catch (e) {
        console.log(e);
        return false;
    }
};



const CompressImageAndUpload = async (image, path = public_image_url) => {
    try {
        let time = new Date().getTime();
        let imagePath = path + time + ".jpg";
        //Any error from sharp will automatically handle in catch block returning false.
        let imageInfo = await sharp(image.data)
            .jpeg({
                quality: 95,
                chromaSubsampling: "4:4:4",
            })
            .toFile(imagePath);
        return {
            path: imagePath.replace(/public/g, ""),
            size: imageInfo.size,
        };
    } catch (e) {
        console.log(e);
        return false;
    }
};



const DeleteFile = async (filepath) => {
    try {
        let isDeleted = fs.unlinkSync("public" + filepath);
        return isDeleted;
    } catch (e) {
        console.log(e);
        return false;
    }
};



/*
===============================================
        Other internal methods below
===============================================
*/

const ValidateEmail = (email) => {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(String(email).toLowerCase());
};



const ValidateMobile = (mobile) => {
    let re = /^\+?\d{10,12}$/;
    return re.test(mobile);
};



const ValidateAlphanumeric = (text) => {
    let re = /^[a-zA-Z0-9\s]+$/;
    return re.test(String(text));
};



const ValidateLength = (text, max = 25, min = 1) => {
    return text.length >= min && text.length <= max ? true : false;
};



const PasswordStrength = (password) => {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.{8,24})(?=.*[0-9])(?=.*[@$!%*#?&])/;
    return re.test(password);
};



const isDataURL = (s) => {
    let regex =
        /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
    return !!s.match(regex);
};



const GeneratePassword = (length = 16) => {
    let result = "";
    let characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};



const HashPasswords = async (password) => {
    return await bcrypt.hash(password, 10);
};



/*
==========================================
    Error Handling Methods
==========================================
*/

const HandleSuccess = (res, data, message) => {
    res.status(200).json({
        code: 200,
        message,
        data,
        status: "success"
    });
    res.end();
};



const HandleCookieSuccess = (res, data) => {
    const option = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    res.cookie("token", data.token, option).status(200).json(data);
    res.end();
};



const HandleError = (res, message) => {
    console.log("Error Message ", message);
    res.status(202).json({
        code: 202,
        error: message,
        status: "error"
    });
    res.end();
};



const UnauthorizedError = (res, message) => {
    res.status(401).json({
        code: 401,
        error: "Unauthorized API call.",
        message,
        status: "Unauthorized"
    });
    res.end();
};



const HandleServerError = (req, res, err) => {
    /*
     * Can log the error data into files to recreate and fix issue.
     * Hiding stack stace from users.
     */
    const errLog = {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        post: req.body,
        error: err,
    };
    // Temporary console log for debug mode
    console.log(errLog);
    res.status(500).json({
        code: 500,
        error: "Something went wrong. Please contact support team.",
        status: "Server Error"
    });
};


exports.IsExists = IsExists;
exports.IsExistsOne = IsExistsOne;
exports.Insert = Insert;
exports.Count = Count;
exports.Find = Find;
exports.FindOne = FindOne;
exports.Delete = Delete;
exports.FindAndUpdate = FindAndUpdate;
exports.UpdateOne = UpdateOne;
exports.UpdateMany = UpdateMany;
exports.Aggregate = Aggregate;
exports.CompressImageAndUpload = CompressImageAndUpload;
exports.DeleteFile = DeleteFile;

exports.HashPasswords = HashPasswords;
exports.ValidateEmail = ValidateEmail;
exports.PasswordStrength = PasswordStrength;
exports.ValidateAlphanumeric = ValidateAlphanumeric;
exports.ValidateMobile = ValidateMobile;
exports.ValidateLength = ValidateLength;
exports.isDataURL = isDataURL;
exports.GeneratePassword = GeneratePassword;
exports.UnauthorizedError = UnauthorizedError;
exports.HandleServerError = HandleServerError;
exports.HandleError = HandleError;
exports.HandleSuccess = HandleSuccess;
exports.HandleCookieSuccess = HandleCookieSuccess;