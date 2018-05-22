import {
    addWrapper,
    capitalizePrint
} from './functions'
import Print from './print'
import html from "./html"

export default {
    print: (params, printFrame) => {
        // Check if we received proper data
        if (typeof params.printable !== 'object') {
            throw new Error('Invalid javascript data object (JSON).')
        }

        // Check if we received proper invoice data
        if (typeof params.invoiceData !== 'object') {
            throw new Error('Invalid javascript data object (JSON).')
        }

        // Check if the repeatTableHeader is boolean
        if (typeof params.repeatTableHeader !== 'boolean') {
            throw new Error('Invalid value for repeatTableHeader attribute (JSON).')
        }

        // Check if properties were provided
        if (!params.properties || typeof params.properties !== 'object') throw new Error('Invalid properties array for your JSON data.')

        // Variable to hold the html string
        let htmlData = ''

        // Check if there is a header on top of the table
        if (params.header) htmlData += '<h1 style="' + params.headerStyle + '">' + params.header + '</h1>'

        // Build html data
        htmlData += jsonToHTML(params)

        // Store html data
        params.htmlData = addWrapper(htmlData, params)

        // Print json data
        Print.send(params, printFrame)
    }
}

function jsonToHTML (params) {
    const date = params.invoiceData.date
    const customer = params.invoiceData.customer
    const invoiceNumber = params.invoiceData.invoiceNumber
    const subtotal = params.invoiceData.subtotal
    const credit = params.invoiceData.credit
    const total = params.invoiceData.total

    // Get the row and column data
    let data = params.printable
    let properties = params.properties

    let htmlData = ''

    if (date) {
        htmlData += '<h3>Fecha: ' + date +'</h3>'
    }

    if (invoiceNumber) {
        htmlData += '<h3>Recibo Nro: ' + invoiceNumber +'</h3>'
    }

    if (customer) {
        htmlData += '<h3>Cliente: ' + customer +'</h3>'
    }

    // Create a table and define the header as repeatable
    htmlData += '<table style="border-collapse: collapse; width: 100%;">'

    // Check if the header should be repeated
    if (params.repeatTableHeader) {
        htmlData += '<thead>'
    }

    // Create the table row
    htmlData += '<tr>'

    // Create a table header for each column
    for (let a = 0; a < properties.length; a++) {
        htmlData += '<th style="width:' + 100 / properties.length + '%; ' + params.gridHeaderStyle + '">' + capitalizePrint(properties[a]) + '</th>'
    }

    // Add the closing tag for the table row
    htmlData += '</tr>'

    // Check if the table header is marked as repeated, then add the closing tag
    if (params.repeatTableHeader) {
        htmlData += '</thead>'
    }

    // Add the closing tag for the table body
    htmlData += '</tr></thead><tbody>'

    // Add the table rows
    for (let i = 0; i < data.length; i++) {
        // Add the row starting tag
        htmlData += '<tr>'

        // Print selected properties only
        for (let n = 0; n < properties.length; n++) {
            let stringData = data[i]

            // Support nested objects
            let property = properties[n].split('.')
            if (property.length > 1) {
                for (let p = 0; p < property.length; p++) {
                    stringData = stringData[property[p]]
                }
            } else {
                stringData = stringData[properties[n]]
            }

            // Add the row contents and styles
            htmlData += '<td style="width:' + 100 / properties.length + '%;' + params.gridStyle + '">' + stringData + '</td>'
        }

        // Add the row ending tag
        htmlData += '</tr>'
    }

    // Add the table closing tag
    htmlData += '</tbody></table>'

    if (subtotal) {
        htmlData += '<h3 style="text-align: right;">Subtotal: ' + subtotal +'</h3>'
    }

    if (credit) {
        htmlData += '<h3 style="text-align: right;">Abono: ' + credit +'</h3>'
    }

    if (total) {
        htmlData += '<h3 style="text-align: right;">Total a pagar: ' + total +'</h3>'
    }

    return htmlData
}
