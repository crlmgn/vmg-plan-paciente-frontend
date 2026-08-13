import logoImg from "../assets/logo-no-alto.png";

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="logo">
      <img src={logoImg} alt="vmg" height={36} />
      {withText && <span className="logo-text">Plan Paciente</span>}
    </span>
  );
}
