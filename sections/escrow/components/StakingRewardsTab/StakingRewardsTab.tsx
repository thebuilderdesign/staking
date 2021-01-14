import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Notify from 'containers/Notify';

import synthetix from 'lib/synthetix';

import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice } from 'utils/network';
import { Transaction } from 'constants/network';
import useEscrowDataQuery from 'hooks/useEscrowDataQueryWrapper';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import { TabContainer } from '../common';
import TabContent from './TabContent';
import MigrateTabContent from './MigrateTabContent';

const StakingRewardsTab: React.FC = () => {
	const escrowDataQuery = useEscrowDataQuery();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);

	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [vestTxError, setVestTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const canVestAmount = escrowDataQuery?.data?.claimableAmount ?? 0;
	const claimableEntryIds = escrowDataQuery?.data?.claimableEntryIds ?? null;
	const totalBalancePendingMigration = escrowDataQuery?.data?.totalBalancePendingMigration ?? 0;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady) {
				const {
					contracts: { RewardsEscrowV2 },
				} = synthetix.js!;
				try {
					setGasEstimateError(null);
					let gasEstimate;
					if (totalBalancePendingMigration === 0 && claimableEntryIds != null) {
						gasEstimate = await getGasEstimateForTransaction(
							[claimableEntryIds],
							RewardsEscrowV2.estimateGas.vest
						);
					} else if (totalBalancePendingMigration > 0) {
						gasEstimate = await getGasEstimateForTransaction(
							[walletAddress],
							RewardsEscrowV2.estimateGas.migrateVestingSchedule
						);
					} else {
						return;
					}
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setGasEstimateError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [
		gasEstimateError,
		isWalletConnected,
		isAppReady,
		totalBalancePendingMigration,
		claimableEntryIds,
	]);

	const handleSubmit = useCallback(async () => {
		if (isAppReady) {
			try {
				setVestTxError(null);
				setTxModalOpen(true);
				const {
					contracts: { RewardEscrowV2 },
				} = synthetix.js!;

				let transaction: ethers.ContractTransaction;
				if (totalBalancePendingMigration === 0) {
					transaction = await RewardEscrowV2.vest(claimableEntryIds, {
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimitEstimate,
					});
				} else {
					transaction = await RewardEscrowV2.migrateVestingSchedule(walletAddress, {
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimitEstimate,
					});
				}

				if (transaction) {
					setTxHash(transaction.hash);
					setTransactionState(Transaction.WAITING);
					monitorHash({
						txHash: transaction.hash,
						onTxConfirmed: () => {
							setTransactionState(Transaction.SUCCESS);
							escrowDataQuery.refetch();
						},
					});
					setTxModalOpen(false);
				}
			} catch (e) {
				setTransactionState(Transaction.PRESUBMIT);
				setVestTxError(e.message);
			}
		}
	}, [
		isAppReady,
		claimableEntryIds,
		gasPrice,
		gasLimitEstimate,
		escrowDataQuery,
		monitorHash,
		totalBalancePendingMigration,
	]);

	return (
		<TabContainer>
			{totalBalancePendingMigration > 0 ? (
				<MigrateTabContent
					onSubmit={handleSubmit}
					transactionError={vestTxError}
					gasEstimateError={gasEstimateError}
					txModalOpen={txModalOpen}
					setTxModalOpen={setTxModalOpen}
					gasLimitEstimate={gasLimitEstimate}
					setGasPrice={setGasPrice}
					txHash={txHash}
					transactionState={transactionState}
					setTransactionState={setTransactionState}
				/>
			) : (
				<TabContent
					claimableAmount={canVestAmount}
					onSubmit={handleSubmit}
					transactionError={vestTxError}
					gasEstimateError={gasEstimateError}
					txModalOpen={txModalOpen}
					setTxModalOpen={setTxModalOpen}
					gasLimitEstimate={gasLimitEstimate}
					setGasPrice={setGasPrice}
					txHash={txHash}
					transactionState={transactionState}
					setTransactionState={setTransactionState}
				/>
			)}
		</TabContainer>
	);
};

export default StakingRewardsTab;
