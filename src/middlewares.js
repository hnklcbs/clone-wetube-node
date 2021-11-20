import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    res.locals.siteName = "wetube";
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};
    console.log(res.locals);
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        return res.redirect("/login");
    }
};

export const publicMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        next()
    } else {
        return res.redirect("/");
    }
};

export const uploadAvatar = multer({
    dest: "uploads/avatars", limits: {
        fileSize:10000000,
    }
});

export const uploadVideo = multer({
    dest: "uploads/videos", limits: {
        fileSize:10000000000,
    }
});