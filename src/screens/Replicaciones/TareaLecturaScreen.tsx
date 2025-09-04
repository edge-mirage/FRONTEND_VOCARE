// src/screens/Replicacion/TareaLecturaScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import ReferenceTextBox from '@/components/ReferenceTextBox';
import RecordMicButton from '@/components/RecordMicButton';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'TareaLectura'>;
type Rt  = RouteProp<ReplicacionStackParamList, 'TareaLectura'>;

// MOCK
const REFERENCE_TEXTS: Record<number, string> = {
  1: "Hola, mi nombre es ..., y hoy estoy haciendo una grabación especial para un proyecto de clonación de voz. Durante el próximo minuto, voy a hablar de manera natural, como si estuviera conversando contigo. Me encanta la idea de que la tecnología pueda recrear mi voz con tanta precisión, siempre y cuando se utilice para fines positivos. Piensa en las posibilidades, audiolibros personalizados, asistentes de voz que suenen familiares, o mensajes especiales que conserven nuestra esencia. Para regularlo, es importante que el audio sea claro, sin ruidos de fondo, y que hable con una entonación variada. Ahora bien, ¿te imaginas escuchar tu propia voz contándote una historia en el futuro? Esa es una de las maravillas de la inteligencia artificial, y por eso estoy participando en esta prueba.",
  2: "Es una mañana fresca de primavera, el cielo está despejado, y el sol ilumina suavemente las copas de los árboles. Una brisa ligera mueve las hojas, creando un murmullo agradable que acompaña al canto de los pájaros. Camino lentamente por una calle tranquila, observando cómo una luz se filtra entre las ramas. A lo lejos, el sonido de una fuerte agua añada un toque relajante al ambiente. El aroma del pan recién horneado se escapa de una pequeña panadería de la esquina, y no puedo evitar sonreír al sentir esa calidez tan reconfortante. Cada paso me doy cuenta de lo fácil que es encontrar la belleza en los detalles simples, y cómo a veces lo cotidiano puede convertirse en un momento perfecto.",
  3: "Recuerdo un verano, hace muchos años, cuando salíamos a pasar las tardes en la playa. Llegábamos temprano, con sombrillas, toallas, y una nevera llena de refrescos. El mar estaba calma, y el agua tenía un tono turquesa brillante. Los niños construían castillos de arena, mientras los adultos charlaban bajo la sombra. A media tarde, el cielo se teñía de tonos naranjos y rosados, y todos nos acercábamos a la orilla para ver el atardecer. Aquellos días eran simples, pero llenos de vida, no importa el tiempo que pasara. Siempre regresábamos a casa con el corazón lleno de alegría, y la piel ligeramente quemada por el sol. Esos recuerdos siguen vivos en mi mente, como si pudiera volver a vivirlos en cualquier momento.",
  4: "La Inteligencia Artificial es un campo de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana. Esto incluye el reconocimiento de voz, la comprensión del lenguaje natural, la visión por computadores, y la toma de decisiones. Los modelos actuales aprenden a partir de grandes volúmenes de datos y pueden mejorar con el tiempo gracias a técnicas como el aprendizaje automático y el aprendizaje profundo. Un ejemplo es el reconocimiento de voz en los teléfonos móviles, que convierte lo que decimos en texto y permite realizar búsquedas o enviar mensajes sin usar las manos. La IA también se utiliza en la medicina, la industria, la educación y el entretenimiento, abriendo un abanico enorme de posibilidades para el futuro.",
  5: "La vida está llena de retos, pero también de oportunidades. Cada día tenemos la posibilidad de aprender algo nuevo, de mejorar en aquello que nos apasiona, y de acercarnos un poco más a nuestras metas. No importa cuántas veces caigamos, lo importante es levantarnos con más fuerza y seguir adelante. La perseverancia es la llave que abre las puertas de los sueños. Cada pequeño paso cuenta. No esperemos a que las circunstancias sean perfectas para empezar. Comienza ahora con lo que tienes e ir desde donde estás. El camino puede ser difícil, pero las recompensas valen cada esfuerzo. Cree en ti mismo, confía en el proceso, y recuerda que lo mejor siempre está por venir.",
  6: "En la mesa hay un plato humeante de sopa recién hecha. El aroma de las verduras se mezcla con el toque suave de las hierbas frescas. A un lado, una rebanada de pan crujiente espera para ser sumergida en el caldo. Al probar la primera cucharada, el calor se extiende por el cuerpo, reconfortando cada rincón. La zanahoria, un dulzor natural. Mientras que el apio añadañe el frescura. El perejil, finamente picado, corona la superficie, liberando un perfume que despierta el apetito. Cada bocado es una invitación a la calma, a disfrutar del momento sin prisas. Comer así no es solo alimentarse, es una experiencia que conecta los sentidos con la memoria y el corazón.",
  7: "¿Buscas una forma de hacer tu día más fácil y productivo? Descubre nuestra nueva aplicación diseñada para ayudarte a realizar tus tareas, gestionar tu tiempo y alcanzar tus objetivos. Con una interfaz intuitiva y funciones inteligentes, tendrás todo lo que necesitas al alcance de tu mano. Imagina recibir recordatorios personalizados, crear listas de pendientes y sincronizar tu calendario en segundos. Además, puedes acceder desde tu teléfono, tableta o computador sin importarte donde estés. Miles de usuarios ya están transformando su forma de trabajar y vivir gracias a nuestra plataforma. ¿Qué esperas para unirte a ellos? Descárgala hoy y comienza a disfrutar de una vida más organizada.",
  8: "Hola, ¿cómo estás? Bien, gracias, ¿y tú? Muy bien. Oye, ¿te acuerdas el viaje a la montaña? Fue increíble. La vista desde la cima era impresionante. Sí, y el aire fresco. Qué sensación tan única. ¿Deberíamos repetirlo algún día? Totalmente. La próxima vez podríamos acampar y ver las estrellas. Me encanta la idea. Podemos planearlo para el próximo mes. Perfecto. Voy a revisar mi agenda y te aviso. Genial. Entonces lo dejamos pendiente. Hecho. Hasta pronto.",
  9: " Viajé a un pequeño pueblo en la costa. Famoso por sus casas de colores y su puerto lleno de barcos pesqueros. Al llegar, el olor a mar y a pescado fresco llenaba el aire. Caminé por calles estrechas de adoquines, saludando a la gente que con amabilidad nos presidía en dilaciones. En la plaza principal, un grupo de música tocaba, melodías alegres mientras los niños corrían alrededor de la fuente. Me senté en una terraza a disfrutar un café, observando el movimiento de las personas. Al final del día, el atardecer queñó el cielo de tonos cálidos y me recordó por qué me encanta viajar. Por esos instantes que se grabó para siempre en la memoria. En la memoria.",
};

export default function TareaLecturaScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const taskIndex = params?.taskIndex ?? 1;

  const title = useMemo(() => `Tarea de Lectura ${taskIndex}`, [taskIndex]);
  const referenceText = useMemo(
    () => REFERENCE_TEXTS[taskIndex] ?? REFERENCE_TEXTS[1],
    [taskIndex]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Replicación de Voz"
        onInfoPress={() => navigation.navigate('Informacion')}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
          {title}
        </Text>

        <Text style={{ marginTop: spacing.md, color: colors.textMuted }}>
          Graba un audio leyendo el texto a continuación:
        </Text>

        <View style={{ height: spacing.md }} />
        <ReferenceTextBox text={referenceText} />

        <View style={{ height: spacing.xl }} />
        <RecordMicButton
          onPress={() => {}}
          // recording={false} // en el futuro puedes togglear esto
        />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}
