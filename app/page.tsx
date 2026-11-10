import { TeezApp } from '../components/teez-app';
import { getDemoCatalog } from '../lib/sources';

export default function Page() {
  return <TeezApp catalog={getDemoCatalog()} />;
}
