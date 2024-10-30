import { DeviceType } from '@libs/common/models/common/device-type.enum'
import { UaParserUtil } from '@libs/utilities/ua-parser/ua-parser.util'

describe('UA Parser', () => {
    const safaRiOnMac =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
    const chromeOnMac =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    const edgeOnMac =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'

    const windowsChrome =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

    const iPhone = 'Doofin/0.0.1 (iOS 17.0; iPhone; iPhone11,6; arm64e)'
    const iPad = 'Doofin/0.0.1 (iPadOS 17.2; iPad; arm64; arm64e)'
    const android = 'doofin/0.0.1 (Android 14; SM-A526B; a52xq; arm64-v8a)'

    const mobileBrowser =
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'
    const mobileBrowser2 =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1'
    it('should parse Safari on Mac', () => {
        const parser = new UaParserUtil(safaRiOnMac)
        expect(parser.getDeviceType()).toEqual(DeviceType.WEB_BROWER)
        expect(parser.getDeviceName()).toEqual('Web Browser - Safari')
    })

    it('should parse Edge on Mac', () => {
        const parser = new UaParserUtil(edgeOnMac)
        expect(parser.getDeviceType()).toEqual(DeviceType.WEB_BROWER)
        expect(parser.getDeviceName()).toEqual('Web Browser - Edge')
    })

    it('should parse Chrome on Mac', () => {
        const parser = new UaParserUtil(chromeOnMac)
        expect(parser.getDeviceType()).toEqual(DeviceType.WEB_BROWER)
        expect(parser.getDeviceName()).toEqual('Web Browser - Chrome')
    })

    it('should parse IPhone', () => {
        const parser = new UaParserUtil(iPhone)
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Apple IPhone')
    })

    it('should parse IPad', () => {
        const parser = new UaParserUtil(iPad)
        expect(parser.getDeviceType()).toEqual(DeviceType.TABLET)
        expect(parser.getDeviceName()).toEqual('Apple IPad')
    })

    it('should parse Android Phone', () => {
        const parser = new UaParserUtil(android)
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Samsung Android SM-A526B')
    })

    it('should parse Mobile browser', () => {
        const parser = new UaParserUtil(mobileBrowser)
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Mobile Browser - Chrome')
    })

    it('should parse Mobile browser 2', () => {
        const parser = new UaParserUtil(mobileBrowser2)
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Mobile Browser - Mobile Safari')
    })
    it('should parse Chrome on Windows', () => {
        const parser = new UaParserUtil(windowsChrome)
        expect(parser.getDeviceType()).toEqual(DeviceType.WEB_BROWER)
        expect(parser.getDeviceName()).toEqual('Web Browser - Chrome')
    })

    it('should parse unknown android device', () => {
        let parser = new UaParserUtil('doofin/0.0.1 (Android 11; M2004J19C; lancelot; mobile; arm64-v8a)')
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Android')

        parser = new UaParserUtil('doofin/0.0.1 (Android 13; sdk_gphone64_arm64; emu64a; mobile; arm64-v8a)')
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Android')

        parser = new UaParserUtil('doofin/0.0.1 (Android 10; vivo 1804; 1804; mobile; arm64-v8a)')
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Android')

        parser = new UaParserUtil('doofin/0.0.1 (Android 14; 22071212AG; plato; mobile; arm64-v8a)')
        expect(parser.getDeviceType()).toEqual(DeviceType.MOBILE)
        expect(parser.getDeviceName()).toEqual('Android')
    })
})
