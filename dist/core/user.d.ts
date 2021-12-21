import { FetchResult } from "@apollo/client";
import { AccountConfirmMutation, AccountDeleteMutation, AccountRequestDeletionMutation, AccountUpdateMutation, ConfirmEmailChangeMutation, CreateAccountAddressMutation, DeleteAccountAddressMutation, RequestEmailChangeMutation, SetAccountDefaultAddressMutation, UpdateAccountAddressMutation } from "../apollo/types";
import { ConfirmAccountOpts, SaleorClientMethodsProps } from "./types";
import { CreateAccountAddressOpts, RequestEmailChangeOpts, SetAccountDefaultAddressOpts, UpdateAccountOpts, UpdateAccountAddressOpts } from "./types";
export interface UserSDK {
    accountDelete: (token: string) => Promise<FetchResult<AccountDeleteMutation>>;
    accountRequestDeletion: (redirectUrl: string) => Promise<FetchResult<AccountRequestDeletionMutation>>;
    confirmEmailChange: (token: string) => Promise<FetchResult<ConfirmEmailChangeMutation>>;
    createAccountAddress: (opts: CreateAccountAddressOpts) => Promise<FetchResult<CreateAccountAddressMutation>>;
    deleteAccountAddress: (addressId: string) => Promise<FetchResult<DeleteAccountAddressMutation>>;
    requestEmailChange: (opts: RequestEmailChangeOpts) => Promise<FetchResult<RequestEmailChangeMutation>>;
    setAccountDefaultAddress: (opts: SetAccountDefaultAddressOpts) => Promise<FetchResult<SetAccountDefaultAddressMutation>>;
    updateAccount: (opts: UpdateAccountOpts) => Promise<FetchResult<AccountUpdateMutation>>;
    updateAccountAddress: (opts: UpdateAccountAddressOpts) => Promise<FetchResult<UpdateAccountAddressMutation>>;
    confirmAccount: (opts: ConfirmAccountOpts) => Promise<FetchResult<AccountConfirmMutation>>;
}
export declare const user: ({ apolloClient: client, channel, }: SaleorClientMethodsProps) => UserSDK;
