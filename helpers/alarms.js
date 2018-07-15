const db = require("../models"),
    fs = require("fs"),
    middleware = require("../middleware"),
    {
        validateAlarm
    } = middleware;

exports = {}

exports.newAlarm = (req, res) => {
    db.House.findById(req.params.id).
    populate("hosts").
    then(house => {
        res.render("alarms/new", {
            house,
            pageName: "New Alarm"
        });
    }).
    catch(err => {
        console.log(err);

        return res.redirect('/houses');
    })
}

exports.createAlarm = (req, res) => {
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
    // Make sure house exists
    db.House.findById(req.params.id).
    then(house => {
        // Create the alarm
        db.Alarm.create(newAlarm).
        then((alarm) => {
            alarm.house.id = req.params.id;
            // Save alarm
            alarm.save();
            // Link to house and save
            house.alarms.push(alarm);
            house.save();
            console.log("Alarm created")
            res.redirect("/houses/" + req.params.id);
        }).
        catch(err => {
            req.flash("error", err.message);
            console.log(err.message);

            return res.redirect('/back');
        })
    }).
    catch(err => {
        req.flash("error", err.message);
        console.log(err.message);

        return res.redirect('/houses');
    })
}

exports.editAlarm = (req, res) => {
    db.House.findById(req.params.id).
    populate("hosts").
    then(house => {
        db.Alarm.findById(req.params.alarm_id).populate("hosts").
        then(alarm => {
            var selectedHosts = [];
            house.hosts.forEach(function (host) {
                alarm.hosts.forEach(function (aHost) {
                    if (aHost._id.equals(host._id)) {
                        selectedHosts.push(aHost._id.toString())
                    }
                });
            });
            res.render("alarms/edit", {
                house,
                alarm,
                selectedHosts,
                pageName: "Edit Alarm"
            });
        }).
        catch(err => {
            console.log(err);

            return res.redirect('/houses');
        })
    }).
    catch(err => {
        console.log(err);

        return res.redirect('/houses');
    })
}

exports.updateAlarm = (req, res) => {
    db.Alarm.findById(req.params.alarm_id).
    then(alarm => {
        if (req.file) {
            try {
                // Delete the old file
                fs.unlink(alarm.file.fullpath).
                catch(err => {
                    console.log(err)
                    req.flash("error", err.message)

                    return res.redirect("back")
                })
                console.log('successfully deleted sound');
                // Save the new file to db
                alarm.file.url = "/sounds/" + req.file.filename
                alarm.file.name = req.file.originalname;
                alarm.file.fullpath = req.file.path
            } catch (err) {
                req.flash("error", err.message)
                console.log(err.message)

                return res.redirect("back")
            }
        }
        alarm.name = req.body.alarm.name;
        alarm.hour = req.body.alarm.hour;
        alarm.minute = req.body.alarm.minute;
        alarm.dow = req.body.alarm.dow;
        alarm.hosts = req.body.alarm.hosts;
        alarm.author = req.user._id;
        if (typeof req.body.active === "undefined") {
            alarm.active = false;
        } else if (req.body.active === "false") { // HACK: Should be sent as true from form but it works for now ¯\_(ツ)_/¯
            alarm.active = true;
        }
        alarm.save();
        req.flash("success", "Successfully Updated!");
        console.log("alarm updated")
        res.redirect("/houses/" + alarm.house.id);
    }).
    catch(err => {
        console.log(err)
        req.flash("error", err.message)

        return res.redirect("back")
    });
}

exports.deleteAlarm = (req, res) => {
    db.House.findByIdAndUpdate(req.params.id, {
        $pull: {
            alarms: req.params.alarm_id
        }
    }).
    then(() => {
        db.Alarm.findById(req.params.alarm_id).
        then(alarm => {
            fs.unlink(alarm.file.fullpath);
            alarm.remove();
            req.flash('success', 'Alarm deleted successfully!');
            console.log("alarm deleted")
            res.redirect("/houses/" + req.params.id);
        }).
        catch(err => {
            console.log(err)
            req.flash("error", err.message)

            return res.redirect("back")
        })
    }).
    catch(err => {
        console.log(err)
        req.flash("error", err.message)

        return res.redirect("back")
    })
}

module.exports = exports;
