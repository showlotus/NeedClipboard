import dayjs from 'dayjs'

type ValidateDate = (date: string | Date | dayjs.Dayjs) => boolean

export const isToday: ValidateDate = (date) => {
  return dayjs().isSame(date, 'date')
}

export const isYesterday: ValidateDate = (date) => {
  return dayjs().subtract(1, 'day').isSame(date, 'date')
}

export const isThisWeek: ValidateDate = (date) => {
  const start = dayjs()
    .subtract(dayjs().get('day') - 1, 'day')
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
  const end = dayjs()
    .add(7 - dayjs().get('day'), 'day')
    .set('hour', 23)
    .set('minute', 59)
    .set('second', 59)
  const o = dayjs(date).valueOf()
  return o >= start.valueOf() && o <= end.valueOf()
}

export const isLastWeek: ValidateDate = (date) => {
  const start = dayjs()
    .subtract(dayjs().get('day') - 1 + 7, 'day')
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
  const end = dayjs()
    .subtract(dayjs().get('day'), 'day')
    .set('hour', 23)
    .set('minute', 59)
    .set('second', 59)
  const o = dayjs(date).valueOf()
  return o >= start.valueOf() && o <= end.valueOf()
}

export const isThisMonth: ValidateDate = (date) => {
  return dayjs().isSame(date, 'month')
}

export const isLastMonth: ValidateDate = (date) => {
  return true
}

export const isThisYear: ValidateDate = (date) => {
  return true
}

export const isLastYear: ValidateDate = (date) => {
  return true
}

export const isLongAgo: ValidateDate = (date) => {
  return true
}
