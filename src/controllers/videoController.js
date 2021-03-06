import Video from "../models/video";
import User from "../models/user";

export const home = async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc" });
    return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner");
    if (!video) return res.status(404).render("404", { pageTitle: "Video not found" });
    return res.render("watch", { pageTitle: video.title, video });
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload" });
};

export const postUpload = async (req, res) => {
    const { _id } = req.session.user;
    const { path: fileUrl } = req.file;
    const { title, description, hashtags } = req.body;
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo, _id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.status(404).render("upload", {
            pageTitle: "Upload",
            errorMessage: error._message,
        });
    }
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) return res.status(404).render("404", { pageTitle: "Video not found" });
    // JS !==는 type도 비교함. video.owner는 ObjectId type
    if (String(video.owner) !== req.session.user._id) return res.status(403).redirect("/");
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.findById(id);
    if (!video) return res.status(404).render("404", { pageTitle: "Video not found" });
    if (String(video.owner) !== req.session.user._id) return res.status(403).redirect("/");
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/video/${id}`);
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) return res.status(404).render("404", { pageTitle: "Video not found" });
    if (String(video.owner) !== req.session.user._id) return res.status(403).redirect("/");
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(`${keyword}`, "i"),
            },
        });
    }
    return res.render("search", { pageTitle: "Search", videos });
};

// api details

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views++;
    await video.save();
    return res.sendStatus(200);
};
