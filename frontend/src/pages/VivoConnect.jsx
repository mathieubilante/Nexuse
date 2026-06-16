import ModuleShell from '../components/ModuleShell.jsx'
import { MODULES } from '../data/modules.js'

export default function VivoConnect() {
  const module = MODULES.find((m) => m.id === 'vivoconnect')
  return (
    <ModuleShell module={module}>
      <div className="mshell-placeholder">
        <h2>En construction</h2>
        <p>
          L'espace VivoConnect (annuaire des hopitaux, disponibilites en
          temps reel, portail etablissements) sera construit ici.
        </p>
      </div>
    </ModuleShell>
  )
}
