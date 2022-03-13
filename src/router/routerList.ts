export interface RouterObj {
  path: string;
  src: string;
  children?: RouterObj[];
}
const list: RouterObj[] = [
  {
    path: '/',
    src: 'Dashboard'
  }
];
export default list;
