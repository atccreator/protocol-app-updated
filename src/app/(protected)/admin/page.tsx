import { useRBAC } from "@/contexts/auth-context";

export default function adminComponent(){
    const { user, isAdmin, isProtocolOfficer, isProtocolIncharge } = useRBAC();
     return (
        <div>
        <h1 text->I am Admin</h1>
        </div>
    );
}