import { useNavigation } from "@react-navigation/native";

export const useBackPress = () => {
  const navigation = useNavigation();

  const handleClose = () => navigation.goBack();
  const handleBackPress = () => handleClose();

  return {
    handleClose,
    handleBackPress,
  }
}