/* Main plugin program ---------------------------------------------------------------- */

(function( $ ) {
    var KEY_BIND = {
        ENTER: 13
    };

    $.fn.dateInput = function (options) {
        var self = this;
        var superfn_hide = this.hide;

        var opts = $.extend( {}, $.fn.dateInput.defaults, options );

        this.hide = function () {
            superfn_hide.call(this);
            self.hidePicker();
        }

        this.showPicker = function () {
            self.container.show();
        }

        this.hidePicker = function () {
            self.container.hide();
        }

        this.isShow = function () {
            return this.container.css("display") !== "none";
        }

        this.updateField = function (text) {
            self.val(text);
        }

        // Create calendar ----------------------------------------/
        this.pickerObj = new PickerObj(this, opts);

        this.btnDone = $("<a>").addClass("btn btn-success btn-ms btn-block").text("Done");
        this.btnDone.click(function () {
            self.hidePicker();
        });

        this.container = $("<div>").addClass("dateinputpicker")
                                .append(this.pickerObj.pickerContent)
                                .append(this.btnDone);
        this.container.css("top", this.position().top + this.height() + 20).css("left", this.position().left + 5);
        this.parent().append(this.container);
        this.hidePicker();

        // Events ----------------------------------------------------/
        $(this).click(function () {
            $(".dateinputpicker").hide();
            self.showPicker();
        });

        $(this).keypress(function(e) {
            if(e.which === KEY_BIND.ENTER) {
                self.pickerObj.changeDateFromInput($(this).val());
            }
        });

        return this;
    }

    $.fn.dateInput.defaults = {
        pressDelay: 300,
        pressRepeatRate: 100
    };

    // Picker object --------------------------------------------------------------------------------------------------/
    var CALENDAR_VIEW_TYPE = {
        DAY: "DAY",
        MONTH: "MONTH",
        YEAR: "YEAR"
    };

    function PickerObj (baseObj, opts) {
        this.baseObj = baseObj;
        this.opts = opts;

        this.btnPrev;
        this.btnNext;
        this.btnDone;
        this.calendar;
        this.pickerContent;

        this.dates = {};
        this.selectedDate = moment();
        this.viewMonth = this.selectedDate.clone();

        this.viewType = CALENDAR_VIEW_TYPE.DAY;

        this.setupContent();
    }

    PickerObj.prototype.setupContent = function () {
        var self = this;

        this.calendar = $("<table>").attr("id", "containerCalendar")
                            .append($("<thead>"))
                            .append($("<tbody>"));

        this.btnPrev = $("<a>").addClass("prev btn btn-default  btn-ms").text("Prev");
        this.btnPrev.mousedown(function() {
            var btn = this;
            self.viewPrev();
            btn.heldTimeoutId = setTimeout(function () {
                btn.heldIntervalId = setInterval(function() {
                    self.viewPrev();
                }, self.opts.pressRepeatRate);
            }, self.opts.pressDelay);
        }).bind("mouseup mouseleave", function() {
            clearTimeout(this.heldTimeoutId);
            clearInterval(this.heldIntervalId);
        });
        this.btnNext = $("<a>").addClass("next btn btn-default  btn-ms").text("Next");
        this.btnNext.mousedown(function() {
            var btn = this;
            self.viewNext();
            btn.heldTimeoutId = setTimeout(function () {
                btn.heldIntervalId = setInterval(function() {
                    self.viewNext();
                }, self.opts.pressRepeatRate);
            }, self.opts.pressDelay);
        }).bind("mouseup mouseleave", function() {
            clearTimeout(this.heldTimeoutId);
            clearInterval(this.heldIntervalId);
        });

        this.pickerContent = $("<div>")
                                .append($("<span>").addClass("arrow").addClass("arrow_outer"))
                                .append($("<span>").addClass("arrow"))
                                .append($("<div>").addClass("control-top")
                                            .append(this.btnPrev)
                                            .append(this.btnNext)
                                        )
                                .append(this.calendar);

        this.updateCalendar(this.selectedDate);
    };

    PickerObj.prototype.updateCalendar = function (targetDate) {

        if (targetDate === undefined)
            targetDate = this.selectedDate;

        var self = this;

        var tmpDate = targetDate.clone();
        var calendarHeader = this.calendar.find("thead");
        var calendarBody = this.calendar.find("tbody");
        calendarHeader.empty();
        calendarBody.empty();
        this.dates = {};

        switch (this.viewType)
        {
            case CALENDAR_VIEW_TYPE.DAY:
                var btnTitle = $("<tr>").addClass("btn-primary")
                                .append($("<th>").text(targetDate.format("YYYY MMMM")).attr("id", "hd-title").attr("colspan", 7));
                btnTitle.click (function () {
                    self.viewType = CALENDAR_VIEW_TYPE.MONTH;
                    self.updateCalendar(targetDate);
                });
                calendarHeader.append(btnTitle);

                calendarBody.append($("<tr>")
                    .append($("<th>").text("SUN"))
                    .append($("<th>").text("MON"))
                    .append($("<th>").text("TUE"))
                    .append($("<th>").text("WED"))
                    .append($("<th>").text("THU"))
                    .append($("<th>").text("FRI"))
                    .append($("<th>").text("SAT"))
                );

                tmpDate.startOf('month');

                var tmpMonth = tmpDate.month();
                var skipDays = tmpDate.weekday();
                tmpDate.subtract(skipDays, 'd');

                for (var weeks = 0; weeks < 6; weeks ++) {
                    var row = $("<tr>");
                    for (var days = 0; days < 7; days ++) {
                        var dayStyleClass = "";

                        if (tmpDate.month() !== tmpMonth)
                            dayStyleClass += "outside-day ";
                        if (days === 0 || days === 6)
                            dayStyleClass += "weekend-day ";
                        if (tmpDate.isSame(this.selectedDate, "day"))
                            dayStyleClass += "selected-day ";

                        var index = weeks + "" + days;
                        var dateButton = $("<td>").text(tmpDate.date()).addClass(dayStyleClass).attr("data-index", index);
                        dateButton.click (function() {
                            self.changeDateFromCalendar($(this).attr("data-index"));
                        });

                        row.append(dateButton);
                        this.dates[index] = tmpDate.clone();
                        tmpDate.add(1, "d");
                    }
                    calendarBody.append(row);
                }
                //console.log("dates:", this.dates);
                break;
            case CALENDAR_VIEW_TYPE.MONTH:
                calendarHeader.append($("<tr>")
                            .append($("<th>").text(targetDate.format("YYYY")).attr("id", "hd-title").attr("colspan", 4))
                        );

                tmpDate.startOf("year");

                for (var row = 0; row < 3; row ++)
                {
                    var tr = $("<tr>");
                    for (var col = 0; col < 4; col ++)
                    {
                        var index = row + "" + col;
                        var dateButton = $("<td>").text(tmpDate.format("MMMM")).addClass(dayStyleClass).attr("data-index", index);
                        dateButton.click (function() {
                            self.viewType = CALENDAR_VIEW_TYPE.DAY;
                            self.viewMonth = self.dates[$(this).attr("data-index")];
                            console.log(self.viewMonth);
                            self.updateCalendar(self.viewMonth);
                        });
                        tr.append(dateButton);
                        this.dates[index] = tmpDate.clone();
                        tmpDate.add(1, "M");
                    }
                    calendarBody.append(tr);
                }
                break;
            case CALENDAR_VIEW_TYPE.YEAR:
                break;
        }

        this.calendar.attr("data-view-type", this.viewType);
    }

    PickerObj.prototype.changeDateFromCalendar = function (index) {
        var selectedNewDate = this.dates[index];
        //console.log("Selected new date:", selectedNewDate);
        this.selectedDate = selectedNewDate;
        this.viewMonth = this.selectedDate.clone();
        this.updateCalendar(this.selectedDate);

        this.baseObj.updateField(this.selectedDate.format("YYYY-MM-DD"));
    }

    PickerObj.prototype.changeDateFromInput = function (strDate) {
        if (isNaN(Date.parse(strDate)))
            return;

        this.selectedDate = moment(Date.parse(strDate));
        this.updateCalendar();
    }

    PickerObj.prototype.viewPrev = function () {
        switch (this.viewType)
        {
            case CALENDAR_VIEW_TYPE.DAY:
                this.viewMonth.subtract(1, "M");
                break;
            case CALENDAR_VIEW_TYPE.MONTH:
                this.viewMonth.subtract(1, "y");
                break;
            case CALENDAR_VIEW_TYPE.YEAR:
                this.viewMonth.subtract(1, "y");
                break;
        }

        this.updateCalendar(this.viewMonth);
    }

    PickerObj.prototype.viewNext = function () {
        switch (this.viewType)
        {
            case CALENDAR_VIEW_TYPE.DAY:
                this.viewMonth.add(1, "M");
                break;
            case CALENDAR_VIEW_TYPE.MONTH:
                this.viewMonth.add(1, "y");
                break;
            case CALENDAR_VIEW_TYPE.YEAR:
                this.viewMonth.add(1, "y");
                break;
        }
        this.updateCalendar(this.viewMonth);
    }
}( jQuery ));
