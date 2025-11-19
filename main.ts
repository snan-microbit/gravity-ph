PH.CalibrarSensor(AnalogPin.P0)
basic.forever(function () {
    basic.showNumber(PH.medirPh())
    basic.pause(2000)
})
