import diorRequest from './dior';

export const get = (key: string, reqOptions: any) => {
 return diorRequest('CDT_9ekvAD', 'common', {
      fcName: 'fatigueHsfService-getFatigue',
      fcArgs: {
        key,
      },
    }, reqOptions)
}

export const set = (key: string, options: any, reqOptions: any) => {
  return diorRequest('CDT_9ekvAD', 'common', {
    fcName: 'fatigueHsfService-setFatigue',
    fcArgs: {
      key,
      ...options,
    },
  }, reqOptions)
}

export const toggle = (key: string, options: any, reqOptions: any) => {
  return diorRequest('CDT_9ekvAD', 'common', {
    fcName: 'fatigueHsfService-fatigue',
    fcArgs: {
      key,
      ...options,
    },
  }, reqOptions)
}

export default {
  get,
  set,
  toggle,
}