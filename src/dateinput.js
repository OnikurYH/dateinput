/* Main plugin program -------------------------*/

(function( $ ) {
    $.fn.dateInput = function () {
        var self = this;

        var superfn_hide = this.hide;

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

        this.pickerObj = new PickerObj(this);

        this.btnDone = $("<a>").text("Done");
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
            var isAlreadyShow = self.isShow();
            $(".dateinputpicker").hide();

            if (!isAlreadyShow)
                return self.showPicker();
        });

        return this;
    }

    var CALENDAR_VIEW_TYPE = {
        DAY: "Day",
        MONTH: "Month",
        YEAR: "Year"
    };

    function PickerObj (baseObj) {
        this.baseObj = baseObj;
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

    // Picker object --------------------------------------------------------------------------------------------------/
    PickerObj.prototype.setupContent = function () {
        var self = this;

        this.calendar = $("<table>")
                            .append($("<thead>"))
                            .append($("<tbody>"));

        this.btnPrev = $("<a>").addClass("prev").text("Prev");
        this.btnPrev.click(function () {
            self.viewPrev();
        });
        this.btnNext = $("<a>").addClass("next").text("Next");
        this.btnNext.click(function () {
            self.viewNext();
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

        if (targetDate === undefined) {
            console.log("No targetDate defined!");
            return;
        }

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
                var btnTitle = $("<tr>")
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
                            self.changeDate($(this).attr("data-index"));
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
    }

    PickerObj.prototype.changeDate = function (index) {
        var selectedNewDate = this.dates[index];
        console.log("Selected new date:", selectedNewDate);
        this.selectedDate = selectedNewDate;
        this.viewMonth = this.selectedDate.clone();
        this.updateCalendar(this.selectedDate);

        this.baseObj.updateField(this.selectedDate.format("YYYY-MM-DD"));
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
