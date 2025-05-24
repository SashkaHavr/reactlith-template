import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { authClient } from '~/lib/auth';
import { trpc } from '~/lib/trpc';

export default function Index() {
  const queryClient = useQueryClient();
  const health = useQuery(trpc.health.queryOptions());
  const authConfig = useQuery(trpc.config.authConfig.queryOptions());

  const session = authClient.useSession();
  const devOTP = authConfig.isSuccess && authConfig.data.devOTP;
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const numbers = useQuery(
    trpc.numbers.getAll.queryOptions(session.data ? void 0 : skipToken),
  );
  const addNumber = useMutation(
    trpc.numbers.addNew.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.numbers.getAll.queryKey(),
        }),
    }),
  );
  const deleteNumbers = useMutation(
    trpc.numbers.deleteAll.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.numbers.getAll.queryKey(),
        }),
    }),
  );

  return (
    <View style={styles.page}>
      <Text>Works!</Text>
      {health.isSuccess && <Text>TRPC status: {health.data}</Text>}
      {devOTP &&
        !session.data &&
        (showOTPInput ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                void authClient.signIn
                  .emailOtp({
                    email: email,
                    otp: otp,
                  })
                  .then(() => {
                    setShowOTPInput(false);
                    setOtp('');
                    setEmail('');
                  })
              }
            >
              <Text>Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1, gap: 2, flexDirection: 'row' }}>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                void authClient.emailOtp
                  .sendVerificationOtp({
                    email: 'test@example.com',
                    type: 'sign-in',
                  })
                  .then(() => setShowOTPInput(true))
              }
            >
              <Text>Send OTP</Text>
            </TouchableOpacity>
          </View>
        ))}
      {session.data && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              void authClient.signOut().then(() => void queryClient.clear())
            }
          >
            <Text>Logout</Text>
          </TouchableOpacity>
          <Text>User: {session.data.user.email}</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addNumber.mutate()}
            >
              <Text>Add number</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => deleteNumbers.mutate()}
            >
              <Text>Delete all numbers</Text>
            </TouchableOpacity>
          </View>
          {numbers.isSuccess && (
            <Text style={styles.numbersText}>
              {JSON.stringify(numbers.data)}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    marginTop: 100,
    gap: 4,
    alignItems: 'center',
  },
  inputContainer: {
    gap: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  input: { height: 40, width: 200, borderWidth: 1, paddingHorizontal: 10 },
  numbersText: { fontSize: 20, fontWeight: 'bold' },
});
