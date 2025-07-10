import Swal from "sweetalert2";

const swalWithCustomTheme = Swal.mixin({
  customClass: {
    popup: "bg-card text-text-primary rounded-lg shadow-lg",
    confirmButton:
      "bg-primary text-white font-bold py-2 px-4 rounded-lg mx-2 hover:opacity-90",
    cancelButton:
      "bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mx-2 hover:opacity-90",
    title: "text-text-primary",
    htmlContainer: "text-text-secondary",
    icon: "border-primary",
  },
  buttonsStyling: false,
});

export default swalWithCustomTheme;
