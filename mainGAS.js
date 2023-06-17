const id = '1TgL7nCsLhyKSzFGJ3Eanhc8df7RZ76agPVl16daMKqE';
const sheet = SpreadsheetApp.openById(id).getSheetByName('nt1');

var lastRow = sheet.getLastRow();
var lastColumn = sheet.getLastColumn();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function doGet(e)
{
    const holder = [];
    for(var row = 2; row <= lastRow; row = row + 1)
    {
        const temp = {
            title: sheet.getRange(row,1).getValue(),
            dateTime: new Date(sheet.getRange(row,2).getValue()),
            description: sheet.getRange(row,3).getValue(),
            attached: sheet.getRange(row,4).getValue()
        }
        holder.push(temp);
    }
    return ContentService.createTextOutput(JSON.stringify(holder)).setMimeType(ContentService.MimeType.JSON);
}


function doPost(e)
{
    try
    {
        switch(e.parameter['operation'])
        {
            case 'addPostData':
                addPostData(e);
                break;

            case 'deleteNotice':
                deleteNotice(e);
                break;

            case 'searchNotice':
                const holder = searchNotice(e);
                return ContentService.createTextOutput(JSON.stringify(holder)).setMimeType(ContentService.MimeType.JSON);

            case 'importNotice':
                importNotice(e);
                break;
        }

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'success': 1 }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    catch(e)
    {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 0 }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}


function addPostData(e)
{
    var foundTitle = '';
    for(var index = 1; index <= lastRow; index = index + 1)
    {
        var title = sheet.getRange(index,1).getValue();
        if(title == e.parameter['title'])
        {
            sheet.getRange(index,2).setValue(new Date(e.parameter['dateTime']));
            sheet.getRange(index,3).setValue(e.parameter['description']);
            sheet.getRange(index,4).setValue(e.parameter['attached']);
            foundTitle = title;
        }
    }
    if(foundTitle == '')
    {
        sheet.appendRow([e.parameter['title'],e.parameter['dateTime'], e.parameter['description'], e.parameter['attached']]);
    }

    addToCalendar(e);
}

function addToCalendar(e)
{
    let start = new Date(e.parameter['dateTime']);
    let end = new Date(e.parameter['dateTime']);
    end.setHours(start.getHours()+1)

    let event = (CalendarApp.getCalendarsByName("Notice"))[0].createEvent
    (
        e.parameter['title'],
        start,
        end,
        {
            description: e.parameter['description']
        }
    );
}

function deleteNotice(e)
{
    for(var index = 1; index <= lastRow; index = index + 1)
    {
        var gotId = sheet.getRange(index,1).getValue();
        if(gotId == e.parameter['title'])
        {
            sheet.deleteRow(index);
        }
    }
}


function searchNotice(e)
{
    const holder = [];
    if(e.parameter['value'] != '')
    {
        for(var row = 1; row <= lastRow; row = row + 1)
        {
            var first = sheet.getRange(row,1).getValue().toString();
            var second = e.parameter['value'].toString();
            if(first.toLowerCase().match(second.toLowerCase()))
            {
                const temp = {
                    title: sheet.getRange(row,1).getValue(),
                    dateTime: sheet.getRange(row,2).getValue(),
                    description: sheet.getRange(row,3).getValue(),
                    attached: sheet.getRange(row,4).getValue(),
                    phone: sheet.getRange(row,5).getValue()
                }
                holder.push(temp);
            }
        }
    }
    else
    {
        for(var row = 2; row <= lastRow; row = row + 1)
        {
            const temp = {
                name: sheet.getRange(row,1).getValue(),
                company: sheet.getRange(row,2).getValue(),
                group: sheet.getRange(row,3).getValue(),
                birthday: sheet.getRange(row,4).getValue(),
                phone: sheet.getRange(row,5).getValue(),
                email: sheet.getRange(row,6).getValue(),
                address: sheet.getRange(row,7).getValue(),
                lastCall: sheet.getRange(row,8).getValue(),
                addition: sheet.getRange(row,9).getValue(),
                description: sheet.getRange(row,10).getValue()
            }
            holder.push(temp);
        }
    }
    return holder;
}


function importNotice(e)
{
    const data = JSON.parse(e.parameter['data']);
    sheet.clear();
    sheet.appendRow(['Title', 'Date Time', 'Description', 'Attached']);
    for(var index = 0; index < data.length; index = index + 1)
    {
        sheet.appendRow([data[index]['title'], new Date(data[index]['dateTime']).toLocaleDateString(), data[index]['description'], data[index]['attached']]);
    }
}