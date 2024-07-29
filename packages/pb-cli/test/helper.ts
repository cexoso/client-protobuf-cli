
export const getList = <T>(list: T[], offset: number) => {
  if (offset > 0) {
    return list[offset]
  }
  return list[list.length + offset]
}
