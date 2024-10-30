import UAParser, { IResult } from 'ua-parser-js'
import { DeviceType } from '@libs/common/models/common/device-type.enum'

export class UaParserUtil {
    private readonly _parser: UAParser

    public constructor(userAgent: string) {
        const myOwnListOfDevices = [
            [/ipad|tablet|pad|tab/i],
            [
                UAParser.DEVICE.VENDOR,
                UAParser.DEVICE.MOBILE,
                UAParser.DEVICE.MODEL,
                [UAParser.DEVICE.TYPE, UAParser.DEVICE.TABLET],
            ],
        ]
        this._parser = new UAParser({
            device: myOwnListOfDevices,
        }).setUA(userAgent)
    }

    public getResult(): IResult {
        return this._parser.getResult()
    }

    public getDeviceType(): DeviceType {
        const deviceType = this._parser.getDevice().type
        if (deviceType && [UAParser.DEVICE.TABLET, UAParser.DEVICE.MOBILE].includes(deviceType as any)) {
            return <DeviceType>deviceType
        } else {
            return DeviceType.WEB_BROWER
        }
    }

    public getDeviceName(): string {
        const ua = this._parser.getUA()
        if (this.getDeviceType() === DeviceType.WEB_BROWER) {
            return `Web Browser - ${this._parser.getBrowser().name}`
        }

        if (this.getDeviceType() === DeviceType.MOBILE) {
            if (!!this._parser.getBrowser().name) {
                return `Mobile Browser - ${this._parser.getBrowser().name}`
            }
            if (ua.match(/IPhone/i)) {
                return 'Apple IPhone'
            }
        }

        if (ua.match(/ipad/i)) {
            return 'Apple IPad'
        }

        return `${this._parser.getDevice().vendor ?? ''} ${this._parser.getOS().name} ${
            this._parser.getDevice().model ?? ''
        }`.trim()
    }
}
