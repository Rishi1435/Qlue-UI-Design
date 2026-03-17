import React from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  size?: number;
};

export function QlueLogo({ size = 72 }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.27 }]}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  image: { width: "100%", height: "100%" },
});
