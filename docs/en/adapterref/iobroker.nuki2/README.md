![Logo](admin/nuki-logo.png)
# ioBroker.nuki2
This ioBroker adapter allows to control and monitor the [Nuki Smart Lock](https://nuki.io/de/) by using both the [Nuki Bridge API](https://developer.nuki.io/page/nuki-bridge-http-api-170/4/#heading--introduction) and the [Nuki Web API](https://developer.nuki.io/page/nuki-web-api-111/3/).

![Number of Installations](http://iobroker.live/badges/nuki2-installed.svg) ![Stable Version](http://iobroker.live/badges/nuki2-stable.svg) [![NPM version](http://img.shields.io/npm/v/iobroker.nuki2.svg)](https://www.npmjs.com/package/iobroker.nuki2)
[![Travis CI](https://travis-ci.org/Zefau/ioBroker.nuki2.svg?branch=master)](https://travis-ci.org/Zefau/ioBroker.nuki2)
[![Downloads](https://img.shields.io/npm/dm/iobroker.nuki2.svg)](https://www.npmjs.com/package/iobroker.nuki2)

[![NPM](https://nodei.co/npm/iobroker.nuki2.png?downloads=true)](https://nodei.co/npm/iobroker.nuki2/)

**Table of contents**
1. [Installation](#installation)
   1. [Get a API token](#get-a-api-token)
   2. [Callback function](#callback-function)
   3. [States](#states)
2. [Smart Home / Alexa integration using ioBroker.javascript](#smart-home--alexa-integration-using-iobrokerjavascript)
3. [Changelog](#changelog)
4. [Credits](#credits)
5. [Licence](#license)


## Installation
### Get a API token
How to get your bridges token:

1. Call ```http://<bridge_ip>:<bridge_port>/auth``` from any browser in your network
2. The bridge turns on its LED
2. Press the button of the bridge within 30 seconds
3. Result of the browser call should be something like this: ```
    {
    "token": “token123”,
    "success": true
    }```

### Callback function
If the callback function is being used, the adapter will try to automatically set the callback on the Nuki bridge when the instance is being saved. All Nuki states will be kept up-to-date by the Nuki bridge while callback is activated.
Callbacks can also be set and removed manually from any browser with following URLs:

* set Callback: ```http://<bridge_ip>:<bridge_port>/callback/add?url=http%3A%2F%2F<host_ip>%3A<host_port>%2Fapi%2Fnuki&token=<bridgeToken>```
* remove Callback: ```http://<bridge_ip>:<bridge_port>/callback/remove?id=<callback_id>&token=<bridgeToken>```
* list all Callbacks: ```http://<bridge_ip>:<bridge_port>/callback/list?token=<bridgeToken>```

### States
If you successfully setup ioBroker.nuki2, the following channels and states are created:

#### Bridges (with Nuki Bridge API)
A bridge will be created as device with the name pattern ```bridge__<name of bridge>```. The following channels / states will be created in each bridge:

| Channel | State | Description |
|:------- |:----- |:----------- |
| - | \_connected | Flag indicating whether or not the bridge is connected to the Nuki server |
| - | bridgeId | ID of the bridge / server |
| - | bridgeIp | IP address of the bridge |
| - | bridgePort | Port of the bridge |
| - | bridgeType | Type of bridge |
| - | hardwareId | ID of the hardware bridge (hardware bridge only) |
| - | refreshed | Timestamp of last update |
| - | uptime | Uptime of the bridge in seconds |
| - | versFirmware | Version of the bridges firmware (hardware bridge only) |
| - | versWifi | Version of the WiFi modules firmware (hardware bridge only) |
| - | versApp | Version of the bridge app (software bridge only) |

#### Locks (with Nuki Bridge API)
A lock will be created as device with the name pattern ```door__<name of door>```. The following channels / states will be created in each lock (when using the Nuki Bridge API):

| Channel | State | Description |
|:------- |:----- |:----------- |
| - | action | Trigger an action on the lock |
| - | bridge | Bridge of the Nuki |
| - | id | ID of the Nuki |
| - | name | Name of the Nuki |
| status | - | Current status of the lock |
| status | batteryCritical | States critical battery level |
| status | lockState | Current lock-state of the Nuki |
| status | locked | Indication if door is locked |
| status | refreshed | Timestamp of last update |

#### Locks (with Nuki Web API)
A lock will be created as device with the name pattern ```door__<name of door>```. The following channels / states will be created in each lock (when using the Nuki Web API):

| Channel | State | Description (possbile Values) |
|:------- |:----- |:----------------------------- |
| - | action | Trigger an action on the lock |
| - | id | ID of the Nuki |
| - | name | Name of the Nuki |
| status | - | Current status of the lock |
| status | batteryCritical | States critical battery level |
| status | closed | Indication if door is closed (boolean of doorState) |
| status | doorState | Current door-state of the Nuki |
| status | lastAction | Last triggered action |
| status | lockState | Current lock-state of the Nuki |
| status | locked | Indication if door is locked |
| status | mode | The smartlock mode<br>`{"0": 'UNINITIALIZED', "1": 'PAIRING', "2": 'NORMAL', "3": 'UNKNOWN', "4": 'MAINTENANCE'}` |
| status | refreshed | Timestamp of last update |
| status | trigger | The state trigger<br>`{"0": 'SYSTEM', "1": 'MANUAL', "2": 'BUTTON', "3": 'AUTOMATIC', "4": 'WEB', "5": 'APP'}` |
| config | - | Configuration of the lock |
| config | gpsLatitude | Latitude |
| config | gpsLongitude | Longitude |
| config | autoUnlatch | True if the door should be unlatched on unlocking (knob) |
| config | pairingEnabled | True if the pairing is allowed via the smartlock button |
| config | buttonEnabled | True if the button on the smartlock is enabled |
| config | ledEnabled | True if the LED on the smartlock is enabled |
| config | ledBrightness | The brightness of the LED: 0 (off) to 5 (max) |
| config | fobPaired | True if a fob is paired with the smartlock |
| config | fobAction1 | The fob action if button is pressed once<br>`{"0": 'NONE', "1": 'UNLOCK', "2": 'LOCK', "3": 'LOCK_N_GO', "4": 'INTELLIGENT'}` |
| config | fobAction2 | The fob action if button is pressed twice<br>`{"0": 'NONE', "1": 'UNLOCK', "2": 'LOCK', "3": 'LOCK_N_GO', "4": 'INTELLIGENT'}` |
| config | fobAction3 | The fob action if button is pressed 3 times<br>`{"0": 'NONE', "1": 'UNLOCK', "2": 'LOCK', "3": 'LOCK_N_GO', "4": 'INTELLIGENT'}` |
| config | singleLock | True if the smartlock should only lock once (instead of twice) |
| config | advertisingMode | The advertising mode (battery saving)<br>`{"0": 'AUTOMATIC', "1": 'NORMAL', "2": 'SLOW', "3": 'SLOWEST'}` |
| config | keypadPaired | True if a keypad is paired with the smartlock |
| config | homekitState | The homekit state<br>`{"0": 'UNAVAILABLE', "1": 'DISABLED', "2": 'ENABLED', "3": 'ENABLED & PAIRED'}` |
| config | timezoneId | The timezone id |
| config.advanced | - | Advanced Configuration of the lock |
| config.advanced | totalDegrees | The absolute total position in degrees that has been reached during calibration |
| config.advanced | unlockedPositionOffsetDegrees | Offset that alters the unlocked position |
| config.advanced | lockedPositionOffsetDegrees | Offset that alters the locked position |
| config.advanced | singleLockedPositionOffsetDegrees | Offset that alters the single locked position |
| config.advanced | unlockedToLockedTransitionOffsetDegrees | Offset that alters the position where transition from unlocked to locked happens |
| config.advanced | lngTimeout | Timeout in seconds for lock ‘n’ go |
| config.advanced | singleButtonPressAction | The desired action, if the button is pressed once<br>`{"0": "NO_ACTION", "1": "INTELLIGENT", "2": "UNLOCK", "3": "LOCK", "4": "UNLATCH", "5": "LOCK_N_GO", "6": "SHOW_STATUS"}` |
| config.advanced | doubleButtonPressAction | The desired action, if the button is pressed twice<br>`{"0": "NO_ACTION", "1": "INTELLIGENT", "2": "UNLOCK", "3": "LOCK", "4": "UNLATCH", "5": "LOCK_N_GO", "6": "SHOW_STATUS"}` |
| config.advanced | detachedCylinder | Flag that indicates that the inner side of the used cylinder is detached from the outer side |
| config.advanced | batteryType | The type of the batteries present in the smart lock<br>`{"0": 'ALKALI', "1": 'ACCUMULATOR', "2": 'LITHIUM'}` |
| config.advanced | automaticBatteryTypeDetection | Flag that indicates if the automatic detection of the battery type is enabled |
| config.advanced | unlatchDuration | Duration in seconds for holding the latch in unlatched position |
| config.advanced | autoLockTimeout | Seconds until the smart lock relocks itself after it has been unlocked. No auto relock if value is 0. |
| users | - | Users of the lock |
| users._userName_ | - | User _userName_ |
| users._userName_ | name | Name of user |
| users._userName_ | type | The type of the authorization<br>`{"0": 'APP', "1": 'BRIDGE', "2": 'FOB', "3": 'KEYPAD', "13": 'KEYPAD CODE', "14": 'Z-KEY', "15": 'VIRTUAL'}` |
| users._userName_ | id | The unique id of user |
| users._userName_ | authId | The smartlock authorization id |
| users._userName_ | enabled | True if the user is enabled |
| users._userName_ | remoteAllowed | True if the auth has remote access |
| users._userName_ | lockCount | The lock count |
| users._userName_ | dateLastActive | The last active date |
| users._userName_ | dateCreated | The creation date |
| users._userName_ | dateUpdated | The update date |
| users._userName_ | allowedFromDate | The allowed from date |
| users._userName_ | allowedUntilDate | The allowed until date |
| users._userName_ | allowedWeekDays | The allowed weekdays<br>`{64: 'Monday', 32: 'Tuesday', 16: 'Wednesday', 8: 'Thursday', 4: 'Friday', 2: 'Saturday', 1: 'Sunday'}` |
| users._userName_ | allowedFromTime | The allowed from time (in minutes from midnight) |
| users._userName_ | allowedUntilTime | The allowed until time (in minutes from midnight) |


## Smart Home / Alexa integration using ioBroker.javascript
Some examples of a possible integration within your smart home.

### Lock door at 10pm in the evening
```javascript
var states = {
    "0": "uncalibrated",
    "1": "locked",
    "2": "unlocking",
    "3": "unlocked",
    "4": "locking",
    "5": "unlatched",
    "6": "unlocked (lock n go)",
    "7": "unlatching",
    "254": "motor blocked",
    "255": "undefined"
};

schedule('0 22 * * *', function()
{
    var status = (getState('nuki2.0.door__home_door.status.lockState').val);
    var msg = 'Main Door door is ' + (states[status]) + '. ';

    if (status == '3')
    {
        setState('nuki2.0.door__home_door.action', 2);
        msg += 'Locking door..'
    }
    else
        msg += 'No action taken.'

    log(msg, {m: 'Nuki', o: ['msg']});
});
```

__Replace `nuki2.0.door__home_door.status.lockState` with the lockState of your lock!__ You may also customize the message via `msg`.


## Changelog

### 0.9.4 / 0.9.5 (2019-03-22)
* (zefau) Useless versions to fix incorrect configuration in `io-package.json`

### 0.9.3 (2019-03-22)
* (zefau) Limited log retrieval to 1000 entries

### 0.9.2 (2019-02-11)
* (zefau) Updated dependency

### 0.9.1 (2019-02-10)
* (zefau) Added Web Interface to view logs

### 0.9.0 (2019-02-09)
* (zefau) Using both Bridge API and Web API
* (zefau) Support for multiple bridges
* (zefau) Support for discovery within admin panel
* (zefau) Additional states for bridges and better separation between software / hardware bridge
  * retrieve the basic and advanced configuration from your lock
  * retrieve all users having access to your lock


## Credits
Thanks to [@Mik13](https://github.com/Mik13) for the [Nuki Bridge API implementation](https://github.com/Mik13/nuki-bridge-api#nuki-bridge-api).

   Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> ([Essential Set](https://www.flaticon.com/packs/essential-set-2)) and <a href="https://www.freepik.com/" title="Freepik">Freepik</a> ([Doors](https://www.flaticon.com/packs/doors)) from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>


## License
The MIT License (MIT)

Copyright (c) 2019 Zefau <zefau@mailbox.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
