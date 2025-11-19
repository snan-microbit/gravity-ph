/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon=""

namespace PH{

    // Define el pin analógico donde está conectado el sensor de pH
    let pHPin: AnalogPin = AnalogPin.P0;
    // Variables para almacenar los valores de calibración (se inicializan con valores por defecto)
    let neutralVoltage: number = 1500; // Valor analógico (mV) para pH 7.0
    let acidVoltage: number = 2000;   // Valor analógico (mV) para pH 4.0
    const microbitVoltage: number = 3300; // Voltaje al que la microbit asigna 1023 
    const CALIBRATION_SAMPLES: number = 50; // Número de muestras para promediar

    // Transforma la lectura analogica an un valor de voltaje
    function readVoltage(): number {
        const rawValue: number = pins.analogReadPin(pHPin);
        const voltage: number = rawValue * microbitVoltage / 1023;
        return voltage;
    }

    // Asigna valores a las variables neutralVoltage y acidVoltage
    function calibratePH(phValue: number) {
        //basic.showString("Calibrando...");
        serial.writeLine("Calibrando...");
        //basic.pause(5000); // Esperar 5 segundos

        let sumVoltage: number = 0;
        for (let i = 0; i < CALIBRATION_SAMPLES; i++) {
            sumVoltage += readVoltage();
            basic.pause(100);
            if (i % 10 == 0) {
                basic.showNumber(phValue);
            }
            else {
                basic.clearScreen();
            }
        }
        const averageVoltage = sumVoltage / CALIBRATION_SAMPLES;

        if (phValue === 7.0) {
            neutralVoltage = averageVoltage;
            basic.showIcon(IconNames.Yes)
            serial.writeLine("pH7 OK (" + neutralVoltage + "mV)");
        } else if (phValue === 4.0) {
            acidVoltage = averageVoltage;
            basic.showIcon(IconNames.Yes)
            serial.writeLine("pH4 OK (" + acidVoltage + "mV)");
        } else {
            basic.showString("Error PH");
            serial.writeLine("Error PH");
        }
    }

    /**
     * Guia al usuario en el proceso de calibracion
     * @param pin pin analogico al que se conecto el sensor
     */
    //% blockId=Calibrar_sensor block="Calibrar sensor conectado en %pin"
    export function CalibrarSensor(pin: AnalogPin) {
        pHPin = pin
        basic.showString("4")
        serial.writeLine("Coloque el electrodo en en el Buffer de PH4 y presione A");
        while (!input.buttonIsPressed(Button.A)) {

        }
        calibratePH(4);
        basic.pause(200);
        basic.showString("7")
        serial.writeLine("Coloque el electrodo en en el Buffer de PH7 y presione A");
        while (!input.buttonIsPressed(Button.A)) {

        }
        calibratePH(7);
        basic.pause(200);
    }

    /**
     * Devuelve el valor de pH
     */
    //% blockId=medirPH block="valor de pH"
    export function medirPh(): number {
        let voltage = readVoltage(); // Leer el voltaje actual
        let phValue: number;

        // Prevenir división por cero si la calibración no se ha realizado correctamente
        if (neutralVoltage === acidVoltage) {
            return 0; // O manejar el error de otra manera
        }

        // Fórmula lineal: PH = 7.0 + (voltaje actual - voltaje pH7) * (4.0 - 7.0) / (voltaje pH4 - voltaje pH7)
        phValue = 7.0 + (voltage - neutralVoltage) * (4.0 - 7.0) / (acidVoltage - neutralVoltage);

        return phValue;
    }
}
