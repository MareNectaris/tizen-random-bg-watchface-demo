/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    var timerUpdateDate = 0,
        flagConsole = false,
        flagDigital = false,
        battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
        interval,
        BACKGROUND_URL = ["url('./images/bg01.jpg')", "url('./images/bg02.jpg')", "url('./images/bg03.jpg')", "url('./images/bg04.jpg')", "url('./images/bg05.jpg')", "url('./images/bg06.jpg')"], //Array of images to be chosen as background(Changes on every wakeup)
        arrDay = ["일", "월", "화", "수", "목", "금", "토"], //Array of weekdays(Sun, Mon, ..., Sat)
        //arrDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], //English
        arrMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; //Array of months(Jan, Feb, ..., Dec)

    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate(prevDay) {
        var datetime = tizen.time.getCurrentDateTime(),
            nextInterval,
            strDay = document.getElementById("str-day"),
            strFullDate,
            strWeekDay = document.getElementById("str-week-day"),
            strFullWeekDay,
            getDay = datetime.getDay(),
            getDate = datetime.getDate(),
            getMonth = datetime.getMonth(),
        	getYear = datetime.getFullYear();

        // Check the update condition.
        // if prevDate is '0', it will always update the date.
        if (prevDay !== null) {
            if (prevDay === getDay) {
                /**
                 * If the date was not changed (meaning that something went wrong),
                 * call updateDate again after a second.
                 */
                nextInterval = 1000;
            } else {
                /**
                 * If the day was changed,
                 * call updateDate at the beginning of the next day.
                 */
                // Calculate how much time is left until the next day.
                nextInterval =
                    (23 - datetime.getHours()) * 60 * 60 * 1000 +
                    (59 - datetime.getMinutes()) * 60 * 1000 +
                    (59 - datetime.getSeconds()) * 1000 +
                    (1000 - datetime.getMilliseconds()) +
                    1;
            }
        }

        if (getDate < 10) {
            getDate = "0" + getDate;
        }

        strFullDate = (getMonth+1)+"."+getDate+"<br>"+arrDay[getDay]+"요일"; //String to take up the bottom left side
        strDay.innerHTML = strFullDate;
        var nowDate = new Date(getYear+"-"+(getMonth+1)+"-"+getDate);
        var satDate = new Date("2020-12-03"); //D-day
        strFullWeekDay = "D-"+(Math.floor((nowDate.getTime()-satDate.getTime())/(1000*60*60*24))*-1-1);
        strWeekDay.innerHTML = strFullWeekDay;

        // If an updateDate timer already exists, clear the previous timer.
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }

        // Set next timeout for date update.
        timerUpdateDate = setTimeout(function() {
            updateDate(getDay);
        }, nextInterval);
    }

    /**
     * Updates the current time.
     * @private
     */
    function updateTime() {
        var strHours = document.getElementById("str-hours"),
            strMinutes = document.getElementById("str-minutes"),
            datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes();

        strHours.innerHTML = hour;
        strMinutes.innerHTML = minute;

//        if (hour < 12) {
//            strAmpm.innerHTML = "AM";
//            if (hour < 10) {
//                strHours.innerHTML = "0" + hour;
//            }
//        } else {
//            strAmpm.innerHTML = "PM";
//        }

        if (minute < 10) {
            strMinutes.innerHTML = "0" + minute;
        }

        // Each 0.5 second the visibility of flagConsole is changed.
//        if(flagDigital) {
//            if (flagConsole) {
//                strConsole.style.visibility = "visible";
//                flagConsole = false;
//            } else {
//                strConsole.style.visibility = "hidden";
//                flagConsole = true;
//            }
//        }
//        else {
//            strConsole.style.visibility = "visible";
//            flagConsole = false;
//        }
    }

    /**
     * Sets to background image as BACKGROUND_URL,
     * and starts timer for normal digital watch mode.
     * @private
     */
    function initDigitalWatch() {
        flagDigital = true; 
        changeBG(); //sets random BG
        interval = setInterval(updateTime, 500);
    }
    
    document.body.addEventListener("click", changeBG);
    function changeBG(){
        document.getElementById("digital-body").style.backgroundImage = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.48) 100%), " + BACKGROUND_URL[Math.floor(Math.random() * 6)]; //sets random BG
    }

    /**
     * Clears timer and sets background image as none for ambient digital watch mode.
     * @private
     */
    function ambientDigitalWatch() { //When clock is set to be always on
    flagDigital = false;
        clearInterval(interval);
        document.getElementById("digital-body").style.backgroundImage = "none";
        updateTime();
    }

    /**
     * Gets battery state.
     * Updates battery level.
     * @private
     */
    function getBatteryState() {
        var batteryLevel = Math.floor(battery.level * 10);
        batteryLevel = batteryLevel + 1;
    }

    /**
     * Updates watch screen. (time and date)
     * @private
     */
    function updateWatch() {
        updateTime();
        updateDate(0);
    }

    /**
     * Binds events.
     * @private
     */
    function bindEvents() {
        // add eventListener for battery state
        battery.addEventListener("chargingchange", getBatteryState);
        battery.addEventListener("chargingtimechange", getBatteryState);
        battery.addEventListener("dischargingtimechange", getBatteryState);
        battery.addEventListener("levelchange", getBatteryState);

        // add eventListener for timetick
        window.addEventListener("timetick", function() {
            ambientDigitalWatch();
        });

        // add eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                // rendering ambient mode case
                ambientDigitalWatch();

            } else {
                // rendering normal digital mode case
                initDigitalWatch();
            }
        });

        // add eventListener to update the screen immediately when the device wakes up.
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                updateWatch();
            }
        });

        // add event listeners to update watch screen when the time zone is changed.
        tizen.time.setTimezoneChangeListener(function() {
            updateWatch();
        });
    }

    /**
     * Initializes date and time.
     * Sets to digital mode.
     * @private
     */
    function init() {
        initDigitalWatch();
        updateDate(0);

        bindEvents();
    }

    window.onload = init();
}());
