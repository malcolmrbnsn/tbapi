const db = require("../models"),
    fs = require("fs"),
    middleware = require("../middleware"),
    {
        validateAlarm
    } = middleware;

exports = {}

exports.newAlarm = async (req, res, next) => {
    try {
        const house = await db.House.findById(req.params.id).populate("hosts")

        return res.render("alarms/new", {
            house,
            pageName: "New Alarm"
        });
    } catch (err) {
        return next(err)
    }
}

exports.createAlarm = async (req, res, next) => {
    try {
        const newAlarm = {
            name: req.body.alarm.name,
            hour: req.body.alarm.hour,
            minute: req.body.alarm.minute,
            dow: req.body.alarm.dow,
            hosts: req.body.alarm.hosts,
            author: req.user._id,
            file: {
                name: req.file.originalname,
                url: "/sounds/" + req.file.filename,
                fullpath: req.file.path
            }
        }
        // Make sure the alarm is alright
        validateAlarm(newAlarm);
        // Find House
        const house = await db.House.findById(req.params.id)
        const alarm = await db.Alarm.create(newAlarm)
        alarm.house.id = req.params.id;
        // Save alarm
        alarm.save();
        // Link to house and save
        house.alarms.push(alarm);
        house.save();

        return res.redirect("/houses/" + req.params.id)

    } catch (err) {
        return next(err)
    }
}

exports.editAlarm = async (req, res, next) => {
    try {
        const house = await db.House.findById(req.params.id).populate("hosts")
        const alarm = await db.Alarm.findById(req.params.alarm_id).populate("hosts")
        var selectedHosts = [];
        house.hosts.forEach(function (host) {
            alarm.hosts.forEach(function (aHost) {
                if (aHost._id.equals(host._id)) {
                    selectedHosts.push(aHost._id.toString())
                }
            });
        });

        return res.render("alarms/edit", {
            house,
            alarm,
            selectedHosts,
            pageName: "Edit Alarm"
        });
    } catch (err) {
        return next(err)
    }
}

exports.updateAlarm = async (req, res, next) => {
    try {
        const alarm = await db.Alarm.findById(req.params.alarm_id)
        if (req.file) {
            // Delete old sounc
            fs.unlink(alarm.file.fullpath)
            alarm.file.url = "/sounds/" + req.file.filename
            alarm.file.name = req.file.originalname;
            alarm.file.fullpath = req.file.path
        }
        alarm.name = req.body.alarm.name;
        alarm.hour = req.body.alarm.hour;
        alarm.minute = req.body.alarm.minute;
        alarm.dow = req.body.alarm.dow;
        alarm.hosts = req.body.alarm.hosts;
        alarm.author = req.user._id;
        if (typeof req.body.active === "undefined") {
            alarm.active = false;
        } else if (req.body.active === "false") { // HACK: Should be sent as true from form
            alarm.active = true;
        }
        await alarm.save();
        req.flash('success', "Alarm updated")

        return res.redirect("/houses/" + alarm.house.id);

    } catch (err) {
        return next(err)
    }
}

exports.deleteAlarm = async (req, res, next) => {
    try {
        const alarm = await db.Alarm.findById(req.params.alarm_id)
        fs.unlink(alarm.file.fullpath, (err) => {
            console.log(err)
            // TODO: throw an error here
        });
        alarm.remove();
        req.flash('success', 'Alarm deleted successfully!');

        return res.redirect("/houses/" + req.params.id);

    } catch (err) {
        return next(err)
    }
}

module.exports = exports;
