import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Content } from '@/primitives/Layout';
import { Button } from '@/primitives/Button';
import { CloseButton } from '@/primitives/ScreenHeader';
import { LuminaMark } from '@/primitives/Wordmark';
import { colors, spacing, type } from '@/theme';

export default function Mission() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="sunrise" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}><CloseButton onPress={() => router.back()} /></View>
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 60 }}>
          <Content style={{ gap: 14 }}>
          <LuminaMark size={54} />
          <Text style={{ ...type.caption, color: colors.deepPurple }}>our mission</Text>
          <Text style={{ ...type.h1, color: colors.text }}>Every child deserves to read and do math with confidence, no matter their background.</Text>
          <Text style={{ ...type.body, color: colors.text }}>
            We built Lumina to give kids one-on-one learning support which adapts to a student's learning style.
            This same kind of personalized attention used to be only something which tutoring could offer — and now it's available to every student for free.
          </Text>
          <View style={{ marginVertical: 8, gap: 6 }}>
            <Text style={{ ...type.h1, color: colors.deepPurple }}>1 in 4</Text>
            <Text style={{ ...type.body, color: colors.text }}>
              Oakland Unified students met or exceeded California's math standard in 2024–25. In a classroom of 30, that is roughly 8 students.
            </Text>
          </View>
          <Text style={{ ...type.body, color: colors.text }}>
            Lumina watches how a student solves a problem, not just whether they got it right — because the difference between those two things is where the learning actually happens.
          </Text>
          <Button full onPress={() => router.back()} trailing={<Ionicons name="arrow-forward" size={20} color={colors.white} />}>
            back to learning
          </Button>
          </Content>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
