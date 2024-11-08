describe('Search API', () => {
    const baseUrl = 'http://localhost:3004/broadcast'

    const makeRequest = (method, url, qs = {}, body = {}) => {
        const options = {
            method,
            url: `${baseUrl}${url}`,
            qs,
            headers: {
                'Content-Type': 'application/json',
                'Authorization':
                    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ3M2ZkMGE0LTIzMzctNGU1Yy1iYmQxLWE0NzZkNmQ3YjQzOSIsIm5hbWUiOiJrbm90IiwicGljdHVyZSI6bnVsbCwiZW1haWwiOm51bGwsImlzQ29uc2VudEFjY2VwdGVkIjp0cnVlLCJzZXR0aW5nIjp7InNob3dQcm9maWxlIjp0cnVlLCJzaG93TmFtZSI6dHJ1ZX0sImlhdCI6MTczMTA1NTE3NSwiZXhwIjoxNzMxMDU4Nzc1LCJqdGkiOiIzYjI1ZDA5OC1iZGYwLTRhNDItODMzZS0yMmZhZjNmOTYwYmQifQ.ch0II1lWxLa7ac2hP4O23YxidxLbXw7WdMbAIt2I1z4s2l_cQItvemFJrj99V5IKs9p7GsIndJCuAjIkRq5xFNHxrszKrOALiedbGwkZ556TpA23XkKgHLgA8CwLS6MvAfmjwnZ45wl9Etx0TXT15dNkz-rAXgKZmfIQytAzEDA8E8BFJUIimzBoTGdOIZR0CjxuH75fTXgnoyppE_V7LVbLOibQgPWJSsFVhgKOTQGbAC44_j3G3Kgbe9_yevzB2zj9A8VtcX9-D2YR4SCSh070nYPGRdhB0mej5samRuCTCV4mVg95t67O13t5tF4w8n2cVMIlQO8Y3bglNpH6jA',
            },
        }

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            options.body = body
        }

        return cy.request(options)
    }

    const validateResponse = (response, status = 200, withData = true) => {
        expect(response.status).to.eq(status)

        if (withData) expect(response.body).to.have.property('data')
    }

    const validateItems = (items, properties) => {
        items.forEach((item) => {
            properties.forEach((property) => {
                expect(item).to.have.property(property)
            })
        })
    }

    it('should get stickers', () => {
        makeRequest('GET', '/stickers').then((response) => {
            validateResponse(response)
            const { data } = response.body
            validateItems(data, [
                'id',
                'price',
                'isFree',
            ])
            expect(data.length).to.be.greaterThan(0)
        })
    })

    it('should create broadcast message and censor bad words', () => {
        makeRequest(
            'POST',
            '/message',
            {},
            {
                message: 'Hello World, damn it, สวัสดีไอ้บ้า',
                stickerId: 1,
                isShowProfileImage: true,
                isShowProfileName: true,
            },
        ).then((response) => {
            validateResponse(response, 201, false)
            expect(response.body).to.have.property('filteredMessage')
            expect(response.body.filteredMessage).to.not.include('damn')
            expect(response.body.filteredMessage).to.not.include('ไอ้')
        })
    })
})
