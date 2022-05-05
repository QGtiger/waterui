export function SpliceArray<T>(arr: T[], start: number, count: number): T[] {
  return arr.splice(start, count);
}

/**
 * 从数组中删除指定元素
 * @param arr 
 * @param item 
 * @returns 
 */
export function SpliceArrayItem<T>(arr: T[], item: T): T[] {
  const index = arr.indexOf(item);
  if (index === -1) {
    console.error('SpliceArrayItem: item not found');
    return
  }
  return arr.splice(arr.indexOf(item), 1);
}