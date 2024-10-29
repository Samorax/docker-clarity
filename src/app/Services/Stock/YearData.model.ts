export interface YearData{
    jan:AttributeData
    feb:AttributeData
    mar:AttributeData
    apr:AttributeData
    may:AttributeData
    jun:AttributeData
    jul:AttributeData
    aug:AttributeData
    sept:AttributeData
    oct:AttributeData
    nov:AttributeData
    dec:AttributeData
}

export interface AttributeData{
    stockQuanity:number
    stockValue:number
}

export interface MonthData{
    data:AttributeData[]

}